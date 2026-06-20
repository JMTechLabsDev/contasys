"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

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

export async function registrarPago(formData: FormData) {
  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const facturaId = formData.get("facturaId") as string;
  const monto = parseFloat(formData.get("monto") as string);
  const metodo = formData.get("metodo") as string;
  const referencia = formData.get("referencia") as string;
  const fechaPago = formData.get("fechaPago") as string;

  if (!facturaId || !monto || monto <= 0) return { error: "Monto inválido" };

  const factura = await prisma.factura.findFirst({
    where: { id: facturaId, empresaId },
    include: { pagos: true },
  });
  if (!factura) return { error: "Factura no encontrada" };

  const totalPagado = factura.pagos.reduce((s, p) => s + Number(p.monto), 0);
  if (totalPagado + monto > Number(factura.total)) {
    return { error: "El pago excede el saldo pendiente" };
  }

  await prisma.pago.create({
    data: {
      empresaId,
      facturaId,
      monto,
      metodo: metodo || undefined,
      referencia: referencia || undefined,
      fechaPago: fechaPago ? new Date(fechaPago) : new Date(),
      registradoPor: (await (await createClient()).auth.getUser()).data.user?.id ?? "",
    },
  });

  revalidatePath(`/cuentas-cobrar`);
  revalidatePath(`/facturas/${facturaId}`);
  return { success: true };
}

export async function eliminarPago(formData: FormData) {
  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const pagoId = formData.get("pagoId") as string;
  if (!pagoId) return { error: "ID requerido" };

  const pago = await prisma.pago.findFirst({ where: { id: pagoId, empresaId } });
  if (!pago) return { error: "Pago no encontrado" };

  await prisma.pago.delete({ where: { id: pagoId } });

  revalidatePath(`/cuentas-cobrar`);
  revalidatePath(`/facturas/${pago.facturaId}`);
  return { success: true };
}
