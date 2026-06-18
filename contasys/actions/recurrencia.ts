"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

export type RecurrenciaActionState = { error?: string; success?: boolean };

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

export async function crearRecurrencia(
  _prevState: RecurrenciaActionState | null,
  formData: FormData,
): Promise<RecurrenciaActionState> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  let rawItems: { descripcion: string; cantidad: number; precioUnitario: number; descuento?: number; impuesto?: string; productoId?: string }[];
  try {
    rawItems = JSON.parse(formData.get("items") as string);
  } catch {
    return { error: "Items inválidos" };
  }

  if (!rawItems.length) return { error: "Agrega al menos un item" };

  await prisma.recurrencia.create({
    data: {
      empresaId,
      clienteId: formData.get("clienteId") as string,
      frecuencia: formData.get("frecuencia") as string,
      diaEjecucion: parseInt(formData.get("diaEjecucion") as string) || 1,
      metodoPago: formData.get("metodoPago") as string || undefined,
      observaciones: formData.get("observaciones") as string || undefined,
      items: {
        create: rawItems.map((i) => ({
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          descuento: i.descuento ?? 0,
          impuesto: i.impuesto ?? "15%",
          productoId: i.productoId || undefined,
        })),
      },
    },
  });

  revalidatePath("/facturas/recurrentes");
  return { success: true };
}

export async function actualizarRecurrencia(
  _prevState: RecurrenciaActionState | null,
  formData: FormData,
): Promise<RecurrenciaActionState> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const id = formData.get("id") as string;
  if (!id) return { error: "ID requerido" };

  let rawItems: { descripcion: string; cantidad: number; precioUnitario: number; descuento?: number; impuesto?: string; productoId?: string }[];
  try {
    rawItems = JSON.parse(formData.get("items") as string);
  } catch {
    return { error: "Items inválidos" };
  }

  if (!rawItems.length) return { error: "Agrega al menos un item" };

  await prisma.$transaction(async (tx) => {
    await tx.recurrenciaItem.deleteMany({ where: { recurrenciaId: id } });
    await tx.recurrencia.update({
      where: { id },
      data: {
        clienteId: formData.get("clienteId") as string,
        frecuencia: formData.get("frecuencia") as string,
        diaEjecucion: parseInt(formData.get("diaEjecucion") as string) || 1,
        metodoPago: formData.get("metodoPago") as string || undefined,
        observaciones: formData.get("observaciones") as string || undefined,
        items: {
          create: rawItems.map((i) => ({
            descripcion: i.descripcion,
            cantidad: i.cantidad,
            precioUnitario: i.precioUnitario,
            descuento: i.descuento ?? 0,
            impuesto: i.impuesto ?? "15%",
            productoId: i.productoId || undefined,
          })),
        },
      },
    });
  });

  revalidatePath("/facturas/recurrentes");
  return { success: true };
}

export async function eliminarRecurrencia(id: string): Promise<void> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return;
  await prisma.recurrencia.delete({ where: { id, empresaId } });
  revalidatePath("/facturas/recurrentes");
}

export async function ejecutarRecurrencia(id: string): Promise<{ error?: string; facturaId?: string }> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const recurrencia = await prisma.recurrencia.findUnique({
    where: { id, empresaId },
    include: { items: true, cliente: true },
  });
  if (!recurrencia) return { error: "Recurrencia no encontrada" };
  if (!recurrencia.items.length) return { error: "Sin items" };

  const ivaTarifa = 0.15;
  let subtotal = 0;
  let descuentoTotal = 0;

  const items = recurrencia.items.map((ri) => {
    const desc = Number(ri.descuento);
    const sub = Number(ri.cantidad) * Number(ri.precioUnitario) - desc;
    const iva = ri.impuesto === "15%" ? sub * ivaTarifa : 0;
    subtotal += Number(ri.cantidad) * Number(ri.precioUnitario);
    descuentoTotal += desc;
    return {
      descripcion: ri.descripcion,
      cantidad: ri.cantidad,
      precioUnitario: ri.precioUnitario,
      descuento: ri.descuento,
      subtotal: sub,
      iva,
      total: sub + iva,
      productoId: ri.productoId,
    };
  });

  const subtotalSinImpuesto = subtotal - descuentoTotal;
  const ivaTotal = items.reduce((s, i) => s + Number(i.iva), 0);
  const total = subtotalSinImpuesto + ivaTotal;

  const ultima = await prisma.factura.findFirst({
    where: { empresaId, numeroFactura: { startsWith: "FAC-" } },
    orderBy: { numeroFactura: "desc" },
    select: { numeroFactura: true },
  });
  const num = ultima ? (parseInt(ultima.numeroFactura.replace("FAC-", ""), 10) || 0) + 1 : 1;
  const numeroFactura = `FAC-${String(num).padStart(4, "0")}`;

  const factura = await prisma.factura.create({
    data: {
      empresaId,
      clienteId: recurrencia.clienteId,
      numeroFactura,
      recurrenciaId: id,
      tipoComprobante: "factura",
      estado: "borrador",
      subtotal,
      descuento: descuentoTotal,
      subtotalSinImpuesto,
      iva: ivaTotal,
      total,
      metodoPago: recurrencia.metodoPago || undefined,
      observaciones: recurrencia.observaciones || undefined,
      facturaItems: {
        create: items.map((i) => ({
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          descuento: i.descuento,
          subtotal: Number(i.subtotal),
          iva: Number(i.iva),
          total: Number(i.total),
          productoId: i.productoId || undefined,
        })),
      },
    },
  });

  await prisma.recurrencia.update({
    where: { id },
    data: { ultimaEjecucion: new Date() },
  });

  revalidatePath("/facturas/recurrentes");
  return { facturaId: factura.id };
}
