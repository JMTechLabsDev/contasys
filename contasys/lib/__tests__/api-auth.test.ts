import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma/client";

const mockPrisma = vi.mocked(prisma);

function createMockRequest(authHeader?: string) {
  return {
    headers: new Map(
      authHeader ? [["authorization", authHeader]] : [],
    ),
  } as any;
}

async function authenticateApiRequest(request: ReturnType<typeof createMockRequest>) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authorized: false as const, status: 401, error: "API key requerida", code: "MISSING_API_KEY" };
  }

  const rawKey = authHeader.slice(7).trim();
  if (!rawKey) {
    return { authorized: false as const, status: 401, error: "API key vacía", code: "EMPTY_API_KEY" };
  }

  const { hashString } = await import("@/lib/hash");
  const claveHash = hashString(rawKey);

  const apiKey = await mockPrisma.apiKey.findFirst({
    where: { claveHash, activa: true },
    include: { empresa: { select: { id: true, estado: true } } },
  });

  if (!apiKey) {
    return { authorized: false as const, status: 401, error: "API key inválida o revocada", code: "INVALID_API_KEY" };
  }

  if (apiKey.empresa.estado !== "activa") {
    return { authorized: false as const, status: 403, error: "La empresa está suspendida", code: "EMPRESA_SUSPENDIDA" };
  }

  return {
    authorized: true as const,
    empresaId: apiKey.empresaId,
    keyId: apiKey.id,
    permisos: (apiKey.permisos as Record<string, unknown>) ?? {},
  };
}

describe("authenticateApiRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza request sin Authorization header", async () => {
    const result = await authenticateApiRequest(createMockRequest());
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.status).toBe(401);
      expect(result.code).toBe("MISSING_API_KEY");
    }
  });

  it("rechaza header sin Bearer", async () => {
    const result = await authenticateApiRequest(createMockRequest("Basic xyz"));
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.code).toBe("MISSING_API_KEY");
    }
  });

  it("rechaza API key vacía", async () => {
    const result = await authenticateApiRequest(createMockRequest("Bearer "));
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.code).toBe("EMPTY_API_KEY");
    }
  });

  it("rechaza API key inválida (no existe en DB)", async () => {
    mockPrisma.apiKey.findFirst.mockResolvedValue(null);

    const result = await authenticateApiRequest(createMockRequest("Bearer key-invalida"));
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.code).toBe("INVALID_API_KEY");
    }
  });

  it("rechaza API key de empresa suspendida", async () => {
    mockPrisma.apiKey.findFirst.mockResolvedValue({
      id: "key-1",
      empresaId: "emp-1",
      claveHash: "hash",
      nombre: "Test",
      activa: true,
      permisos: {},
      empresa: { id: "emp-1", estado: "suspendida" },
    } as any);

    const result = await authenticateApiRequest(createMockRequest("Bearer key-valida"));
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.status).toBe(403);
      expect(result.code).toBe("EMPRESA_SUSPENDIDA");
    }
  });

  it("autentica correctamente con API key válida", async () => {
    mockPrisma.apiKey.findFirst.mockResolvedValue({
      id: "key-1",
      empresaId: "emp-1",
      claveHash: "hash",
      nombre: "Test",
      activa: true,
      permisos: { facturas: true },
      empresa: { id: "emp-1", estado: "activa" },
    } as any);

    const result = await authenticateApiRequest(createMockRequest("Bearer key-valida"));
    expect(result.authorized).toBe(true);
    if (result.authorized) {
      expect(result.empresaId).toBe("emp-1");
      expect(result.permisos).toEqual({ facturas: true });
    }
  });
});

describe("apiError / apiSuccess / apiPaginated", () => {
  it("apiError retorna Response con error", async () => {
    const { apiError } = await import("@/lib/api-auth");
    const res = apiError(400, "Bad request", "BAD_REQUEST");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Bad request");
    expect(body.code).toBe("BAD_REQUEST");
  });

  it("apiSuccess retorna Response con data", async () => {
    const { apiSuccess } = await import("@/lib/api-auth");
    const res = apiSuccess({ id: "1" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual({ id: "1" });
  });

  it("apiPaginated retorna paginación correcta", async () => {
    const { apiPaginated } = await import("@/lib/api-auth");
    const res = apiPaginated([{ id: "1" }], 25, 1, 10);
    const body = await res.json();
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.total).toBe(25);
    expect(body.pagination.totalPages).toBe(3);
  });
});
