import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { hashString } from "@/lib/hash";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export type ApiAuthResult =
  | { authorized: true; empresaId: string; keyId: string; permisos: Record<string, unknown> }
  | { authorized: false; status: number; error: string; code: string };

export async function authenticateApiRequest(request: NextRequest): Promise<ApiAuthResult> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authorized: false, status: 401, error: "API key requerida. Usa header: Authorization: Bearer <key>", code: "MISSING_API_KEY" };
  }

  const rawKey = authHeader.slice(7).trim();
  if (!rawKey) {
    return { authorized: false, status: 401, error: "API key vacía", code: "EMPTY_API_KEY" };
  }

  const claveHash = hashString(rawKey);

  const apiKey = await prisma.apiKey.findFirst({
    where: { claveHash, activa: true },
    include: { empresa: { select: { id: true, estado: true } } },
  });

  if (!apiKey) {
    return { authorized: false, status: 401, error: "API key inválida o revocada", code: "INVALID_API_KEY" };
  }

  if (apiKey.empresa.estado !== "activa") {
    return { authorized: false, status: 403, error: "La empresa está suspendida", code: "EMPRESA_SUSPENDIDA" };
  }

  const now = Date.now();
  const windowKey = `${apiKey.id}:${Math.floor(now / RATE_LIMIT_WINDOW_MS)}`;
  const entry = rateLimitStore.get(windowKey);

  if (entry && entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { authorized: false, status: 429, error: `Límite de ${RATE_LIMIT_MAX_REQUESTS} requests por minuto alcanzado`, code: "RATE_LIMIT_EXCEEDED" };
  }

  if (!entry) {
    rateLimitStore.set(windowKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count++;
  }

  if (rateLimitStore.size > 10_000) {
    for (const [key, val] of rateLimitStore) {
      if (val.resetAt < now) rateLimitStore.delete(key);
    }
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { ultimoUso: new Date() },
  });

  return {
    authorized: true,
    empresaId: apiKey.empresaId,
    keyId: apiKey.id,
    permisos: (apiKey.permisos as Record<string, unknown>) ?? {},
  };
}

export function apiError(status: number, error: string, code: string, details?: unknown) {
  return Response.json({ error, code, ...(details ? { details } : {}) }, { status });
}

export function apiSuccess(data: unknown, status = 200) {
  return Response.json({ data }, { status });
}

export function apiPaginated(data: unknown[], total: number, page: number, limit: number) {
  return Response.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
