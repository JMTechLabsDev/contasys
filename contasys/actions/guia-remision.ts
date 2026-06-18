"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

export type GuiaState = { error?: string; success?: boolean };

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

async function generarNumero(empresaId: string): Promise<string> {
  const ultima = await prisma.factura.findFirst({
    where: { empresaId, numeroFactura: { startsWith: "GUI-" } },
    orderBy: { numeroFactura: "desc" },
    select: { numeroFactura: true },
  });
  const num = ultima ? (parseInt(ultima.numeroFactura.replace("GUI-", ""), 10) || 0) + 1 : 1;
  return `GUI-${String(num).padStart(4, "0")}`;
}

export async function crearGuiaRemision(
  _prevState: GuiaState | null,
  formData: FormData,
): Promise<GuiaState> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const clienteId = formData.get("clienteId") as string;
  if (!clienteId) return { error: "Selecciona un cliente" };

  let rawItems: { descripcion: string; cantidad: number; productoId?: string }[];
  try {
    rawItems = JSON.parse(formData.get("items") as string);
  } catch {
    return { error: "Items inválidos" };
  }
  if (!rawItems.length) return { error: "Agrega al menos un item" };

  const numeroFactura = await generarNumero(empresaId);

  await prisma.factura.create({
    data: {
      empresaId,
      clienteId,
      numeroFactura,
      tipoComprobante: "guia_remision",
      estado: "pendiente",
      subtotal: 0,
      descuento: 0,
      subtotalSinImpuesto: 0,
      iva: 0,
      total: 0,
      puntoPartida: formData.get("puntoPartida") as string || undefined,
      puntoDestino: formData.get("puntoDestino") as string || undefined,
      transportistaNombre: formData.get("transportistaNombre") as string || undefined,
      transportistaRuc: formData.get("transportistaRuc") as string || undefined,
      placa: formData.get("placa") as string || undefined,
      fechaInicioTransporte: formData.get("fechaInicioTransporte") ? new Date(formData.get("fechaInicioTransporte") as string) : undefined,
      destinatarioNombre: formData.get("destinatarioNombre") as string || undefined,
      destinatarioRuc: formData.get("destinatarioRuc") as string || undefined,
      destinatarioDireccion: formData.get("destinatarioDireccion") as string || undefined,
      facturaReferenciaId: formData.get("facturaReferenciaId") as string || undefined,
      observaciones: formData.get("observaciones") as string || undefined,
      facturaItems: {
        create: rawItems.map((i) => ({
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precioUnitario: 0,
          descuento: 0,
          subtotal: 0,
          iva: 0,
          total: 0,
          productoId: i.productoId || undefined,
        })),
      },
    },
  });

  revalidatePath("/facturas/guias");
  return { success: true };
}

export async function crearGuiaDesdeFactura(
  facturaId: string,
  formData: FormData,
): Promise<GuiaState> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const factura = await prisma.factura.findUnique({
    where: { id: facturaId, empresaId },
    include: { facturaItems: true },
  });
  if (!factura) return { error: "Factura no encontrada" };
  if (factura.estado !== "autorizado") return { error: "Solo facturas autorizadas" };

  const numeroFactura = await generarNumero(empresaId);

  await prisma.factura.create({
    data: {
      empresaId,
      clienteId: factura.clienteId,
      numeroFactura,
      tipoComprobante: "guia_remision",
      estado: "pendiente",
      subtotal: 0,
      descuento: 0,
      subtotalSinImpuesto: 0,
      iva: 0,
      total: 0,
      puntoPartida: formData.get("puntoPartida") as string || undefined,
      puntoDestino: formData.get("puntoDestino") as string || undefined,
      transportistaNombre: formData.get("transportistaNombre") as string || undefined,
      transportistaRuc: formData.get("transportistaRuc") as string || undefined,
      placa: formData.get("placa") as string || undefined,
      fechaInicioTransporte: formData.get("fechaInicioTransporte") ? new Date(formData.get("fechaInicioTransporte") as string) : undefined,
      destinatarioNombre: formData.get("destinatarioNombre") as string || undefined,
      destinatarioRuc: formData.get("destinatarioRuc") as string || undefined,
      destinatarioDireccion: formData.get("destinatarioDireccion") as string || undefined,
      facturaReferenciaId: facturaId,
      observaciones: formData.get("observaciones") as string || undefined,
      facturaItems: {
        create: factura.facturaItems.map((i) => ({
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precioUnitario: 0,
          descuento: 0,
          subtotal: 0,
          iva: 0,
          total: 0,
          productoId: i.productoId || undefined,
        })),
      },
    },
  });

  revalidatePath(`/facturas/${facturaId}`);
  revalidatePath("/facturas/guias");
  return { success: true };
}
