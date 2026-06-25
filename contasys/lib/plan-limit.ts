import { prisma } from "./prisma/client";

export async function verificarLimiteFacturas(empresaId: string): Promise<{ ok: boolean; mensaje?: string }> {
  const suscripcion = await prisma.suscripcion.findFirst({
    where: { empresaId, estado: { in: ["trial", "activa"] } },
    include: { plan: true },
  });
  if (!suscripcion) return { ok: false, mensaje: "No hay suscripción activa" };
  if (suscripcion.plan.limiteFacturas === null) return { ok: true };

  const count = await prisma.factura.count({
    where: { empresaId, creadoEn: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
  });
  if (count >= suscripcion.plan.limiteFacturas) {
    return { ok: false, mensaje: `Has alcanzado el límite de ${suscripcion.plan.limiteFacturas} facturas mensuales de tu plan ${suscripcion.plan.nombre}` };
  }
  return { ok: true };
}

export async function verificarLimiteUsuarios(empresaId: string): Promise<{ ok: boolean; mensaje?: string }> {
  const suscripcion = await prisma.suscripcion.findFirst({
    where: { empresaId, estado: { in: ["trial", "activa"] } },
    include: { plan: true },
  });
  if (!suscripcion) return { ok: false, mensaje: "No hay suscripción activa" };
  if (suscripcion.plan.limiteUsuarios === null) return { ok: true };

  const count = await prisma.empresaUsuario.count({ where: { empresaId, activo: true } });
  if (count >= suscripcion.plan.limiteUsuarios) {
    return { ok: false, mensaje: `Has alcanzado el límite de ${suscripcion.plan.limiteUsuarios} usuarios de tu plan ${suscripcion.plan.nombre}` };
  }
  return { ok: true };
}

export async function verificarMultiempresa(empresaId: string): Promise<{ ok: boolean; mensaje?: string }> {
  const suscripcion = await prisma.suscripcion.findFirst({
    where: { empresaId, estado: { in: ["trial", "activa"] } },
    include: { plan: true },
  });
  if (!suscripcion) return { ok: false, mensaje: "No hay suscripción activa" };
  if (suscripcion.plan.multiempresa) return { ok: true };

  const count = await prisma.empresaUsuario.count({
    where: { usuarioId: (await prisma.empresa.findUnique({ where: { id: empresaId }, select: { empresaUsuarios: { take: 1, select: { usuarioId: true } } } }))?.empresaUsuarios[0]?.usuarioId, activo: true },
  });
  return { ok: true };
}

export async function obtenerSuscripcion(empresaId: string) {
  const suscripcion = await prisma.suscripcion.findFirst({
    where: { empresaId, estado: { in: ["trial", "activa", "vencida"] } },
    orderBy: { creadoEn: "desc" },
    include: { plan: true, planPendiente: true },
  });
  if (!suscripcion) return null;

  const facturasMes = await prisma.factura.count({
    where: { empresaId, creadoEn: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
  });
  const usuariosActivos = await prisma.empresaUsuario.count({ where: { empresaId, activo: true } });
  const empresasCount = await prisma.empresaUsuario.count({
    where: { usuarioId: (await prisma.empresa.findUnique({ where: { id: empresaId }, select: { empresaUsuarios: { take: 1, select: { usuarioId: true } } } }))?.empresaUsuarios[0]?.usuarioId, activo: true },
  });

  return {
    ...suscripcion,
    facturasMes,
    usuariosActivos,
    plan: {
      ...suscripcion.plan,
      limiteFacturas: suscripcion.plan.limiteFacturas ?? Infinity,
      limiteUsuarios: suscripcion.plan.limiteUsuarios ?? Infinity,
    },
  };
}
