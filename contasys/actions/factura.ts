"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { facturaSchema } from "@/lib/validations/factura";
import { crearNotificacionEmpresa } from "./notificacion";

export type FacturaState = { error?: string };

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

async function generarNumeroFactura(empresaId: string, prefijo = "FAC-"): Promise<string> {
  const ultima = await prisma.factura.findFirst({
    where: { empresaId, numeroFactura: { startsWith: prefijo } },
    orderBy: { numeroFactura: "desc" },
    select: { numeroFactura: true },
  });

  if (!ultima) return `${prefijo}0001`;

  const num = parseInt(ultima.numeroFactura.replace(prefijo, ""), 10) || 0;
  return `${prefijo}${String(num + 1).padStart(4, "0")}`;
}

export async function crearFactura(
  _prevState: FacturaState | null,
  formData: FormData,
): Promise<FacturaState> {
  let rawItems: unknown;
  try {
    rawItems = JSON.parse(formData.get("items") as string);
  } catch {
    return { error: "Error al procesar los items de la factura" };
  }

  const parsed = facturaSchema.safeParse({
    clienteId: formData.get("clienteId"),
    tipoComprobante: formData.get("tipoComprobante") || "factura",
    metodoPago: formData.get("metodoPago"),
    observaciones: formData.get("observaciones"),
    descuentoGlobal: formData.get("descuentoGlobal") || 0,
    items: rawItems,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const cliente = await prisma.cliente.findFirst({
    where: { id: parsed.data.clienteId, empresaId, activo: true },
  });
  if (!cliente) return { error: "Cliente no encontrado" };

  const items = parsed.data.items;
  const descuentoGlobal = parsed.data.descuentoGlobal;

  let subtotal = 0;
  let totalIva = 0;

  const itemsData = items.map((item) => {
    const base = item.cantidad * item.precioUnitario;
    const descItem = item.descuento * item.cantidad;
    const sub = base - descItem;
    const ivaPorcentaje = item.impuesto === "15%" ? 0.15 : 0;
    const iva = sub * ivaPorcentaje;
    const total = sub + iva;

    subtotal += sub;
    totalIva += iva;

    return {
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      descuento: item.descuento,
      subtotal: sub,
      iva,
      total,
      productoId: item.productoId || null,
    };
  });

  const descuentoGlobalNum = Number(descuentoGlobal);
  const subtotalConDescuento = Math.max(0, subtotal - descuentoGlobalNum);
  const ivaFinal = totalIva;
  const totalFinal = subtotalConDescuento + ivaFinal;

  const numeroFactura = await generarNumeroFactura(empresaId);

  await prisma.factura.create({
    data: {
      empresaId,
      clienteId: parsed.data.clienteId,
      numeroFactura,
      tipoComprobante: parsed.data.tipoComprobante as any,
      estado: "borrador",
      subtotal,
      descuento: descuentoGlobalNum,
      subtotalSinImpuesto: subtotalConDescuento,
      iva: ivaFinal,
      total: totalFinal,
      metodoPago: parsed.data.metodoPago || null,
      observaciones: parsed.data.observaciones || null,
      facturaItems: { create: itemsData },
    },
  });

  revalidatePath("/facturas");
  redirect("/facturas");
}

export async function actualizarEstadoFactura(formData: FormData) {
  const id = formData.get("id") as string;
  const estado = formData.get("estado") as string;
  if (!id || !estado) return;

  const empresaId = await getEmpresaId();
  if (!empresaId) return;

  const estadosValidos = ["borrador", "pendiente", "procesando", "autorizado", "rechazado", "anulado"];
  if (!estadosValidos.includes(estado)) return;

  const factura = await prisma.factura.update({
    where: { id, empresaId },
    data: { estado: estado as any },
    include: { cliente: { select: { nombre: true } } },
  });

  if (estado === "autorizado") {
    await crearNotificacionEmpresa(empresaId, "factura_autorizada", `Factura #${factura.numeroFactura} autorizada`, `La factura a ${factura.cliente.nombre} fue autorizada por el SRI.`, `/facturas/${id}`);
  } else if (estado === "rechazado") {
    await crearNotificacionEmpresa(empresaId, "factura_rechazada", `Factura #${factura.numeroFactura} rechazada`, `La factura a ${factura.cliente.nombre} fue rechazada por el SRI.`, `/facturas/${id}`);
  }

  revalidatePath("/facturas");
  revalidatePath(`/facturas/${id}`);
}

async function crearComprobanteDerivado(
  empresaId: string,
  originalId: string,
  tipo: "nota_credito" | "nota_debito",
  prefijo: string,
): Promise<string | { error: string }> {
  const original = await prisma.factura.findFirst({
    where: { id: originalId, empresaId },
    include: { facturaItems: true, cliente: true },
  });
  if (!original) return { error: "Factura no encontrada" };
  if (original.estado !== "autorizado") return { error: "Solo se pueden crear comprobantes de facturas autorizadas" };

  const nuevoNumero = await generarNumeroFactura(empresaId, prefijo);
  const tipoLabel = tipo === "nota_credito" ? "Nota de Crédito" : "Nota de Débito";

  await prisma.factura.create({
    data: {
      empresaId,
      clienteId: original.clienteId,
      numeroFactura: nuevoNumero,
      tipoComprobante: tipo,
      estado: "borrador",
      subtotal: original.subtotal,
      descuento: original.descuento,
      subtotalSinImpuesto: original.subtotalSinImpuesto,
      iva: original.iva,
      total: original.total,
      metodoPago: original.metodoPago,
      observaciones: `${tipoLabel} por Factura ${original.numeroFactura}`,
      facturaItems: {
        create: original.facturaItems.map((i) => ({
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          descuento: i.descuento,
          subtotal: i.subtotal,
          iva: i.iva,
          total: i.total,
          productoId: i.productoId,
        })),
      },
    },
  });

  return nuevoNumero;
}

export async function crearNotaCredito(_prevState: FacturaState | null, formData: FormData): Promise<FacturaState> {
  const originalId = formData.get("id") as string;
  if (!originalId) return { error: "ID requerido" };

  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const result = await crearComprobanteDerivado(empresaId, originalId, "nota_credito", "NC-");
  if (typeof result !== "string") return result;

  revalidatePath("/facturas");
  redirect("/facturas");
}

export async function crearNotaDebito(_prevState: FacturaState | null, formData: FormData): Promise<FacturaState> {
  const originalId = formData.get("id") as string;
  if (!originalId) return { error: "ID requerido" };

  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const result = await crearComprobanteDerivado(empresaId, originalId, "nota_debito", "ND-");
  if (typeof result !== "string") return result;

  revalidatePath("/facturas");
  redirect("/facturas");
}

export async function duplicarFactura(_prevState: FacturaState | null, formData: FormData): Promise<FacturaState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "ID requerido" };

  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const original = await prisma.factura.findFirst({
    where: { id, empresaId },
    include: { facturaItems: true },
  });
  if (!original) return { error: "Factura no encontrada" };

  const nuevoNumero = await generarNumeroFactura(empresaId);

  await prisma.factura.create({
    data: {
      empresaId,
      clienteId: original.clienteId,
      numeroFactura: nuevoNumero,
      tipoComprobante: original.tipoComprobante,
      estado: "borrador",
      subtotal: original.subtotal,
      descuento: original.descuento,
      subtotalSinImpuesto: original.subtotalSinImpuesto,
      iva: original.iva,
      total: original.total,
      metodoPago: original.metodoPago,
      observaciones: original.observaciones ? `${original.observaciones}\n(Duplicado de ${original.numeroFactura})` : `Duplicado de ${original.numeroFactura}`,
      facturaItems: {
        create: original.facturaItems.map((i) => ({
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          descuento: i.descuento,
          subtotal: i.subtotal,
          iva: i.iva,
          total: i.total,
          productoId: i.productoId,
        })),
      },
    },
  });

  revalidatePath("/facturas");
  redirect("/facturas");
}

export async function crearFacturaRapida(
  _prevState: FacturaState | null,
  formData: FormData,
): Promise<FacturaState> {
  const clienteId = formData.get("clienteId") as string;
  const descripcion = formData.get("descripcion") as string;
  const cantidad = parseFloat(formData.get("cantidad") as string) || 1;
  const precioUnitario = parseFloat(formData.get("precioUnitario") as string) || 0;
  const metodoPago = (formData.get("metodoPago") as string) || "efectivo";
  const impuesto = (formData.get("impuesto") as string) || "15%";

  if (!clienteId) return { error: "Selecciona un cliente" };
  if (!descripcion) return { error: "La descripción es requerida" };
  if (precioUnitario <= 0) return { error: "El precio debe ser mayor a 0" };

  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, empresaId, activo: true },
  });
  if (!cliente) return { error: "Cliente no encontrado" };

  const ivaPorcentaje = impuesto === "15%" ? 0.15 : 0;
  const base = cantidad * precioUnitario;
  const sub = base;
  const iva = sub * ivaPorcentaje;
  const total = sub + iva;
  const numeroFactura = await generarNumeroFactura(empresaId);

  await prisma.factura.create({
    data: {
      empresaId,
      clienteId,
      numeroFactura,
      tipoComprobante: "factura",
      estado: "borrador",
      subtotal: sub,
      descuento: 0,
      subtotalSinImpuesto: sub,
      iva,
      total,
      metodoPago,
      facturaItems: { create: { descripcion, cantidad, precioUnitario, descuento: 0, subtotal: sub, iva, total } },
    },
  });

  revalidatePath("/facturas");
  redirect("/facturas");
}

export async function eliminarFactura(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const empresaId = await getEmpresaId();
  if (!empresaId) return;

  await prisma.facturaItem.deleteMany({ where: { facturaId: id, factura: { empresaId } } });
  await prisma.pago.deleteMany({ where: { facturaId: id, empresaId } });
  await prisma.factura.deleteMany({ where: { id, empresaId } });

  revalidatePath("/facturas");
  redirect("/facturas");
}
