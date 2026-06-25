"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { generarXMLFactura } from "@/lib/sri/xml-generator";
import { enviarComprobanteSRI } from "@/lib/sri/sri-client";
import { autorizarComprobanteSRI } from "@/lib/sri/mock-api";
import { firmarXML } from "@/lib/sri/firma-electronica";
import { crearNotificacionEmpresa } from "./notificacion";
import { decrypt } from "@/lib/encryption";

async function getEmpresaId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get("empresa_activa")?.value;

  const eu = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true, ...(empresaActivaId ? { empresaId: empresaActivaId } : {}) },
  });
  return eu?.empresaId ?? null;
}

export async function enviarFacturaSRI(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return { error: "ID requerido" };

  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const factura = await prisma.factura.findFirst({
    where: { id, empresaId },
    include: { cliente: true, facturaItems: true, empresa: true },
  });
  if (!factura) return { error: "Factura no encontrada" };

  if (factura.estado !== "pendiente" && factura.estado !== "procesando") {
    return { error: "La factura debe estar en estado pendiente o procesando" };
  }

  await prisma.factura.update({ where: { id }, data: { estado: "procesando" } });

  try {
    const serie = "001";
    const xml = generarXMLFactura({
      numeroFactura: factura.numeroFactura,
      fechaEmision: factura.fechaEmision,
      tipoComprobante: factura.tipoComprobante,
      subtotal: Number(factura.subtotal),
      descuento: Number(factura.descuento),
      subtotalSinImpuesto: Number(factura.subtotalSinImpuesto),
      iva: Number(factura.iva),
      total: Number(factura.total),
      metodoPago: factura.metodoPago,
      observaciones: factura.observaciones,
      cliente: {
        tipoIdentificacion: factura.cliente.tipoIdentificacion,
        identificacion: factura.cliente.identificacion,
        nombre: factura.cliente.nombre,
        razonSocial: factura.cliente.razonSocial,
        direccion: factura.cliente.direccion,
        email: factura.cliente.email,
      },
      items: factura.facturaItems.map((i) => ({
        descripcion: i.descripcion,
        cantidad: Number(i.cantidad),
        precioUnitario: Number(i.precioUnitario),
        descuento: Number(i.descuento),
        subtotal: Number(i.subtotal),
        iva: Number(i.iva),
        total: Number(i.total),
      })),
      empresa: {
        ruc: factura.empresa.ruc,
        razonSocial: factura.empresa.razonSocial,
        nombreComercial: factura.empresa.nombre,
        direccion: factura.empresa.direccion || "",
        ciudad: factura.empresa.ciudad || "",
        provincia: factura.empresa.provincia || "PICHINCHA",
        telefono: factura.empresa.telefono || "",
        email: factura.empresa.email || "",
        regimenTributario: factura.empresa.regimenTributario || undefined,
        tipoContribuyente: factura.empresa.tipoContribuyente || undefined,
      },
      ambiente: (process.env.SRI_AMBIENTE || factura.empresa.ambiente) as "pruebas" | "produccion",
      serie,
    });

    const p12Base64 = factura.empresa.p12Cifrado ? decrypt(factura.empresa.p12Cifrado) : "";
    const claveFirma = factura.empresa.claveFirmaCifrada ? decrypt(factura.empresa.claveFirmaCifrada) : "";
    const xmlFirmado = firmarXML(xml, p12Base64, claveFirma);
    const claveAcceso = xmlFirmado.match(/<claveAcceso>(\d{49})<\/claveAcceso>/)?.[1] || "";

    const ambiente = (process.env.SRI_AMBIENTE || factura.empresa.ambiente) as "pruebas" | "produccion";

    let respuestaSri;
    let ultimoError: string | null = null;
    const maxIntentos = ambiente === "produccion" ? 1 : 3;

    for (let intento = 1; intento <= maxIntentos; intento++) {
      respuestaSri = ambiente === "produccion"
        ? await enviarComprobanteSRI(xmlFirmado, ambiente)
        : await autorizarComprobanteSRI(claveAcceso, xmlFirmado, ambiente);

      if (respuestaSri.estado === "AUTORIZADO") break;

      if (respuestaSri.estado === "RECHAZADO") {
        ultimoError = respuestaSri.errores?.[0]?.mensaje || "Rechazado por el SRI";
        if (intento < maxIntentos) {
          await new Promise((r) => setTimeout(r, 2000 * intento));
        }
      }
    }

    const updateData: Record<string, unknown> = {
      xmlGenerado: xmlFirmado,
      claveAcceso,
      sriRespuesta: respuestaSri! as Record<string, unknown>,
    };

    if (respuestaSri!.estado === "AUTORIZADO") {
      updateData.estado = "autorizado";
      updateData.fechaAutorizacion = respuestaSri!.fechaAutorizacion
        ? new Date(respuestaSri!.fechaAutorizacion)
        : new Date();
      await crearNotificacionEmpresa(empresaId, "sri_autorizado", `Factura #${factura.numeroFactura} autorizada por SRI`, `Comprobante a ${factura.cliente.nombre} fue AUTORIZADO.`, `/facturas/${id}`);
    } else if (respuestaSri!.estado === "RECHAZADO") {
      updateData.estado = "rechazado";
      await crearNotificacionEmpresa(empresaId, "sri_rechazado", `Factura #${factura.numeroFactura} rechazada por SRI`, `Comprobante a ${factura.cliente.nombre} fue RECHAZADO.`, `/facturas/${id}`);
    }

    await prisma.factura.update({ where: { id }, data: updateData as any });

    revalidatePath(`/facturas/${id}`);
    return {
      success: true,
      estado: respuestaSri!.estado,
      errores: respuestaSri!.errores,
      reintentos: ultimoError ? maxIntentos : 0,
    };
  } catch (err) {
    await prisma.factura.update({ where: { id }, data: { estado: "pendiente" } });
    return { error: err instanceof Error ? err.message : "Error al enviar al SRI" };
  }
}
