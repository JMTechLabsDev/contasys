import { vi } from "vitest";

vi.mock("@/lib/prisma/client", () => {
  const mockPrisma = {
    suscripcion: {
      findFirst: vi.fn(),
    },
    factura: {
      count: vi.fn(),
    },
    empresaUsuario: {
      count: vi.fn(),
    },
    cliente: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditoria: {
      create: vi.fn(),
    },
    empresa: {
      findUnique: vi.fn(),
    },
    apiKey: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});
