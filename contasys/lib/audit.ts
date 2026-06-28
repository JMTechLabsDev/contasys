import { prisma } from "@/lib/prisma/client";

type AuditInput = {
  empresaId: string;
  usuarioId: string;
  accion: string;
  recurso: string;
  recursoId?: string;
  datosAnteriores?: Record<string, unknown>;
  datosNuevos?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
};

export async function registrarAuditoria(input: AuditInput) {
  await prisma.auditoria.create({
    data: {
      empresaId: input.empresaId,
      usuarioId: input.usuarioId,
      accion: input.accion,
      recurso: input.recurso,
      recursoId: input.recursoId,
      datosAnteriores: input.datosAnteriores ?? undefined as any,
      datosNuevos: input.datosNuevos ?? undefined as any,
      ip: input.ip,
      userAgent: input.userAgent,
    },
  });
}
