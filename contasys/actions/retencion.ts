"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

export type RetencionState = { error?: string; success?: boolean };

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

export async function getClientes(): Promise<Array<{ id: string; nombre: string; identificacion: string }>> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return [];
  return prisma.cliente.findMany({
    where: { empresaId, activo: true },
    select: { id: true, nombre: true, identificacion: true },
    orderBy: { nombre: "asc" },
  });
}

async function generarNumero(empresaId: string): Promise<string> {
  const ultima = await prisma.factura.findFirst({
    where: { empresaId, numeroFactura: { startsWith: "RET-" } },
    orderBy: { numeroFactura: "desc" },
    select: { numeroFactura: true },
  });
  const num = ultima ? (parseInt(ultima.numeroFactura.replace("RET-", ""), 10) || 0) + 1 : 1;
  return `RET-${String(num).padStart(4, "0")}`;
}

export async function crearRetencion(
  _prevState: RetencionState | null,
  formData: FormData,
): Promise<RetencionState> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const clienteId = formData.get("clienteId") as string;
  const facturaRefId = formData.get("facturaReferenciaId") as string;
  const ejercicioFiscal = parseInt(formData.get("ejercicioFiscal") as string);
  const impuestoRetenido = formData.get("impuestoRetenido") as string;
  const porcentajeRetener = parseFloat(formData.get("porcentajeRetener") as string);
  const baseImponible = parseFloat(formData.get("baseImponibleRet") as string);
  const valorRetenido = baseImponible * (porcentajeRetener / 100);

  if (!clienteId || !ejercicioFiscal || !impuestoRetenido || !porcentajeRetener || !baseImponible) {
    return { error: "Todos los campos son requeridos" };
  }

  const numeroFactura = await generarNumero(empresaId);

  await prisma.factura.create({
    data: {
      empresaId,
      clienteId,
      numeroFactura,
      tipoComprobante: "retencion",
      estado: "autorizado",
      subtotal: baseImponible,
      descuento: 0,
      subtotalSinImpuesto: baseImponible,
      iva: 0,
      total: valorRetenido,
      ejercicioFiscal,
      impuestoRetenido,
      porcentajeRetener,
      valorRetenido,
      baseImponibleRet: baseImponible,
      facturaReferenciaId: facturaRefId || undefined,
      observaciones: formData.get("observaciones") as string || undefined,
    },
  });

  revalidatePath("/facturas/retenciones");
  return { success: true };
}

export async function crearRetencionDesdeFactura(
  facturaId: string,
  formData: FormData,
): Promise<RetencionState> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const factura = await prisma.factura.findUnique({
    where: { id: facturaId, empresaId },
    include: { cliente: true },
  });
  if (!factura) return { error: "Factura no encontrada" };
  if (factura.estado !== "autorizado") return { error: "Solo facturas autorizadas" };

  const ejercicioFiscal = parseInt(formData.get("ejercicioFiscal") as string);
  const impuestoRetenido = formData.get("impuestoRetenido") as string;
  const porcentajeRetener = parseFloat(formData.get("porcentajeRetener") as string);
  const baseImponible = parseFloat(formData.get("baseImponibleRet") as string);
  const valorRetenido = baseImponible * (porcentajeRetener / 100);

  if (!ejercicioFiscal || !impuestoRetenido || !porcentajeRetener || !baseImponible) {
    return { error: "Todos los campos son requeridos" };
  }

  const numeroFactura = await generarNumero(empresaId);

  await prisma.factura.create({
    data: {
      empresaId,
      clienteId: factura.clienteId,
      numeroFactura,
      tipoComprobante: "retencion",
      estado: "autorizado",
      subtotal: baseImponible,
      descuento: 0,
      subtotalSinImpuesto: baseImponible,
      iva: 0,
      total: valorRetenido,
      ejercicioFiscal,
      impuestoRetenido,
      porcentajeRetener,
      valorRetenido,
      baseImponibleRet: baseImponible,
      facturaReferenciaId: facturaId,
      observaciones: formData.get("observaciones") as string || undefined,
    },
  });

  revalidatePath(`/facturas/${facturaId}`);
  revalidatePath("/facturas/retenciones");
  return { success: true };
}
