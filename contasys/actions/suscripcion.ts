"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { createOrder, captureOrder, cancelSubscription as paypalCancel } from "@/lib/paypal/client";

export type SubState = { error?: string; orderId?: string; success?: string } | null;

async function getEmpresaId(): Promise<string> {
  const cookieStore = await cookies();
  const empresaId = cookieStore.get("empresa_activa")?.value;
  if (!empresaId) throw new Error("No hay empresa activa");
  return empresaId;
}

export async function obtenerEstadoSuscripcion() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let empresaId: string;
  try { empresaId = await getEmpresaId(); } catch { return null; }

  const suscripcion = await prisma.suscripcion.findFirst({
    where: { empresaId },
    orderBy: { creadoEn: "desc" },
    include: { plan: true, planPendiente: true, pagos: { orderBy: { creadoEn: "desc" }, take: 10 } },
  });
  if (!suscripcion) return null;

  const planes = await prisma.plan.findMany({ where: { activo: true }, orderBy: { precioMensual: "asc" } });
  const facturasMes = await prisma.factura.count({
    where: { empresaId, creadoEn: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
  });
  const usuariosActivos = await prisma.empresaUsuario.count({ where: { empresaId, activo: true } });

  return { suscripcion, planes, facturasMes, usuariosActivos };
}

export async function crearOrdenPayPal(_prevState: SubState, formData: FormData): Promise<SubState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  let empresaId: string;
  try { empresaId = await getEmpresaId(); } catch { return { error: "No hay empresa activa" }; }

  const planId = formData.get("planId") as string;
  const periodo = formData.get("periodo") as "mensual" | "anual";
  if (!planId || !periodo) return { error: "Faltan datos" };

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return { error: "Plan no encontrado" };

  const monto = periodo === "anual" ? Number(plan.precioAnual) : Number(plan.precioMensual);
  const descripcion = `ContaSys - Plan ${plan.nombre} (${periodo === "anual" ? "Anual" : "Mensual"})`;

  try {
    const order = await createOrder(monto, descripcion, `${process.env.NEXT_PUBLIC_APP_URL}/suscripcion?success=1`, `${process.env.NEXT_PUBLIC_APP_URL}/suscripcion?cancel=1`);

    if (order.id) {
      await prisma.suscripcion.updateMany({
        where: { empresaId, estado: { in: ["trial", "activa"] } },
        data: { paypalOrderId: order.id },
      });
    }

    return order.id ? { orderId: order.id } : { error: order.message || "Error al crear orden PayPal" };
  } catch {
    return { error: "Error de conexión con PayPal" };
  }
}

export async function capturarOrdenPayPal(orderId: string, planId: string, periodo: "mensual" | "anual"): Promise<SubState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  let empresaId: string;
  try { empresaId = await getEmpresaId(); } catch { return { error: "No hay empresa activa" }; }

  try {
    const capture = await captureOrder(orderId);
    if (capture.status === "COMPLETED") {
      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (!plan) return { error: "Plan no encontrado" };

      const monto = periodo === "anual" ? Number(plan.precioAnual) : Number(plan.precioMensual);
      const transactionId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id;

      await prisma.suscripcion.updateMany({
        where: { empresaId },
        data: { estado: "activa", planId, periodo, fechaInicio: new Date(), fechaFin: periodo === "anual" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      });

      await prisma.pagoSuscripcion.create({
        data: { empresaId, suscripcionId: (await prisma.suscripcion.findFirst({ where: { empresaId }, orderBy: { creadoEn: "desc" }, select: { id: true } }))!.id, monto, paypalTransactionId: transactionId, estado: "completado", periodDesde: new Date(), periodHasta: periodo === "anual" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      });

      revalidatePath("/suscripcion");
      return { success: "Pago completado exitosamente" };
    }
    return { error: "El pago no fue completado" };
  } catch {
    return { error: "Error al capturar el pago" };
  }
}

export async function cancelarSuscripcionPayPal(): Promise<SubState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  let empresaId: string;
  try { empresaId = await getEmpresaId(); } catch { return { error: "No hay empresa activa" }; }

  const suscripcion = await prisma.suscripcion.findFirst({ where: { empresaId, estado: "activa" } });
  if (!suscripcion) return { error: "No hay suscripción activa" };

  if (suscripcion.paypalSubscriptionId) {
    await paypalCancel(suscripcion.paypalSubscriptionId);
  }

  await prisma.suscripcion.update({ where: { id: suscripcion.id }, data: { estado: "cancelada" } });

  revalidatePath("/suscripcion");
  return { success: "Suscripción cancelada. Tendrás acceso hasta el final del período pagado." };
}

export async function programarCambioPlan(_prevState: SubState, formData: FormData): Promise<SubState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  let empresaId: string;
  try { empresaId = await getEmpresaId(); } catch { return { error: "No hay empresa activa" }; }

  const planId = formData.get("planId") as string;
  const periodo = formData.get("periodo") as "mensual" | "anual";
  if (!planId || !periodo) return { error: "Faltan datos" };

  const suscripcion = await prisma.suscripcion.findFirst({ where: { empresaId, estado: { in: ["activa", "trial"] } } });
  if (!suscripcion) return { error: "No hay suscripción activa" };

  if (suscripcion.planId === planId && suscripcion.periodo === periodo) {
    return { error: "Ya estás en este plan" };
  }

  await prisma.suscripcion.update({
    where: { id: suscripcion.id },
    data: { planPendienteId: planId, periodoPendiente: periodo },
  });

  revalidatePath("/suscripcion");
  return { success: "Cambio de plan programado. Se aplicará al finalizar tu período actual." };
}
