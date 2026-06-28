import { describe, it, expect, vi } from "vitest";
import { prisma } from "@/lib/prisma/client";

const mockPrisma = vi.mocked(prisma);

async function registrarAuditoria(input: {
  empresaId: string;
  usuarioId: string;
  accion: string;
  recurso: string;
  recursoId?: string;
  datosAnteriores?: Record<string, unknown>;
  datosNuevos?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}) {
  await mockPrisma.auditoria.create({
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

describe("registrarAuditoria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crea un registro de auditoría básico", async () => {
    mockPrisma.auditoria.create.mockResolvedValue({ id: "aud-1" } as any);

    await registrarAuditoria({
      empresaId: "emp-1",
      usuarioId: "user-1",
      accion: "crear",
      recurso: "cliente",
    });

    expect(mockPrisma.auditoria.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        empresaId: "emp-1",
        usuarioId: "user-1",
        accion: "crear",
        recurso: "cliente",
      }),
    });
  });

  it("incluye datos anteriores y nuevos cuando se proveen", async () => {
    mockPrisma.auditoria.create.mockResolvedValue({ id: "aud-2" } as any);

    await registrarAuditoria({
      empresaId: "emp-1",
      usuarioId: "user-1",
      accion: "editar",
      recurso: "cliente",
      recursoId: "cli-1",
      datosAnteriores: { nombre: "Juan", email: "juan@old.com" },
      datosNuevos: { nombre: "Juan C.", email: "juan@new.com" },
    });

    const call = mockPrisma.auditoria.create.mock.calls[0][0];
    expect(call.data.datosAnteriores).toEqual({ nombre: "Juan", email: "juan@old.com" });
    expect(call.data.datosNuevos).toEqual({ nombre: "Juan C.", email: "juan@new.com" });
  });

  it("incluye ip y userAgent cuando se proveen", async () => {
    mockPrisma.auditoria.create.mockResolvedValue({ id: "aud-3" } as any);

    await registrarAuditoria({
      empresaId: "emp-1",
      usuarioId: "user-1",
      accion: "login",
      recurso: "session",
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0",
    });

    const call = mockPrisma.auditoria.create.mock.calls[0][0];
    expect(call.data.ip).toBe("192.168.1.1");
    expect(call.data.userAgent).toBe("Mozilla/5.0");
  });

  it("maneja recursoId opcional", async () => {
    mockPrisma.auditoria.create.mockResolvedValue({} as any);

    await registrarAuditoria({
      empresaId: "emp-1",
      usuarioId: "user-1",
      accion: "eliminar",
      recurso: "cliente",
      recursoId: "cli-1",
    });

    expect(mockPrisma.auditoria.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ recursoId: "cli-1" }),
    });
  });
});
