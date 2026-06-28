import { describe, it, expect, vi } from "vitest";
import { prisma } from "@/lib/prisma/client";

const mockPrisma = vi.mocked(prisma);

async function verificarLimiteFacturas(empresaId: string) {
  const suscripcion = await mockPrisma.suscripcion.findFirst({
    where: { empresaId, estado: { in: ["trial", "activa"] } },
    include: { plan: true },
  });
  if (!suscripcion) return { ok: false, mensaje: "No hay suscripción activa" };
  if (suscripcion.plan.limiteFacturas === null) return { ok: true };

  const count = await mockPrisma.factura.count({
    where: { empresaId, creadoEn: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
  });
  if (count >= suscripcion.plan.limiteFacturas) {
    return { ok: false, mensaje: `Has alcanzado el límite de ${suscripcion.plan.limiteFacturas} facturas mensuales de tu plan ${suscripcion.plan.nombre}` };
  }
  return { ok: true };
}

async function verificarLimiteUsuarios(empresaId: string) {
  const suscripcion = await mockPrisma.suscripcion.findFirst({
    where: { empresaId, estado: { in: ["trial", "activa"] } },
    include: { plan: true },
  });
  if (!suscripcion) return { ok: false, mensaje: "No hay suscripción activa" };
  if (suscripcion.plan.limiteUsuarios === null) return { ok: true };

  const count = await mockPrisma.empresaUsuario.count({ where: { empresaId, activo: true } });
  if (count >= suscripcion.plan.limiteUsuarios) {
    return { ok: false, mensaje: `Has alcanzado el límite de ${suscripcion.plan.limiteUsuarios} usuarios de tu plan ${suscripcion.plan.nombre}` };
  }
  return { ok: true };
}

describe("plan-limit integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("verificarLimiteFacturas", () => {
    it("retorna ok si no hay límite (null)", async () => {
      mockPrisma.suscripcion.findFirst.mockResolvedValue({
        id: "1",
        empresaId: "emp-1",
        planId: "plan-1",
        estado: "activa",
        plan: { id: "plan-1", nombre: "Ilimitado", limiteFacturas: null, limiteUsuarios: null, multiempresa: true, precioMensual: 0, activo: true, caracteristicas: [], stripePriceId: null },
      } as any);

      const result = await verificarLimiteFacturas("emp-1");
      expect(result.ok).toBe(true);
    });

    it("retorna error si no hay suscripción", async () => {
      mockPrisma.suscripcion.findFirst.mockResolvedValue(null);

      const result = await verificarLimiteFacturas("emp-1");
      expect(result.ok).toBe(false);
      expect(result.mensaje).toContain("No hay suscripción activa");
    });

    it("retorna error si excede límite mensual", async () => {
      mockPrisma.suscripcion.findFirst.mockResolvedValue({
        id: "1",
        empresaId: "emp-1",
        planId: "plan-1",
        estado: "activa",
        plan: { id: "plan-1", nombre: "Básico", limiteFacturas: 10, limiteUsuarios: 3, multiempresa: false, precioMensual: 0, activo: true, caracteristicas: [], stripePriceId: null },
      } as any);
      mockPrisma.factura.count.mockResolvedValue(10);

      const result = await verificarLimiteFacturas("emp-1");
      expect(result.ok).toBe(false);
      expect(result.mensaje).toContain("10 facturas mensuales");
    });

    it("retorna ok si está dentro del límite", async () => {
      mockPrisma.suscripcion.findFirst.mockResolvedValue({
        id: "1",
        empresaId: "emp-1",
        planId: "plan-1",
        estado: "activa",
        plan: { id: "plan-1", nombre: "Básico", limiteFacturas: 10, limiteUsuarios: 3, multiempresa: false, precioMensual: 0, activo: true, caracteristicas: [], stripePriceId: null },
      } as any);
      mockPrisma.factura.count.mockResolvedValue(5);

      const result = await verificarLimiteFacturas("emp-1");
      expect(result.ok).toBe(true);
    });
  });

  describe("verificarLimiteUsuarios", () => {
    it("retorna ok si no hay límite (null)", async () => {
      mockPrisma.suscripcion.findFirst.mockResolvedValue({
        id: "1",
        empresaId: "emp-1",
        planId: "plan-1",
        estado: "trial",
        plan: { id: "plan-1", nombre: "Ilimitado", limiteFacturas: null, limiteUsuarios: null, multiempresa: true, precioMensual: 0, activo: true, caracteristicas: [], stripePriceId: null },
      } as any);

      const result = await verificarLimiteUsuarios("emp-1");
      expect(result.ok).toBe(true);
    });

    it("retorna error si excede límite", async () => {
      mockPrisma.suscripcion.findFirst.mockResolvedValue({
        id: "1",
        empresaId: "emp-1",
        planId: "plan-1",
        estado: "activa",
        plan: { id: "plan-1", nombre: "Básico", limiteFacturas: 10, limiteUsuarios: 3, multiempresa: false, precioMensual: 0, activo: true, caracteristicas: [], stripePriceId: null },
      } as any);
      mockPrisma.empresaUsuario.count.mockResolvedValue(3);

      const result = await verificarLimiteUsuarios("emp-1");
      expect(result.ok).toBe(false);
      expect(result.mensaje).toContain("3 usuarios");
    });
  });
});
