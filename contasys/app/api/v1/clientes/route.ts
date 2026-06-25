import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { authenticateApiRequest, apiSuccess, apiError, apiPaginated } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth.authorized) return apiError(auth.status, auth.error, auth.code);

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
  const search = searchParams.get("search");

  const where: Record<string, unknown> = { empresaId: auth.empresaId, activo: true };
  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: "insensitive" } },
      { identificacion: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where: where as any,
      select: { id: true, tipoIdentificacion: true, identificacion: true, nombre: true, email: true, telefono: true, ciudad: true, activo: true, creadoEn: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { nombre: "asc" },
    }),
    prisma.cliente.count({ where: where as any }),
  ]);

  return apiPaginated(clientes, total, page, limit);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth.authorized) return apiError(auth.status, auth.error, auth.code);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "Cuerpo de la solicitud inválido", "INVALID_JSON");
  }

  if (!body.nombre || typeof body.nombre !== "string" || body.nombre.trim().length < 2) {
    return apiError(400, "El nombre es requerido (mín. 2 caracteres)", "VALIDATION_ERROR");
  }

  const cliente = await prisma.cliente.create({
    data: {
      empresaId: auth.empresaId,
      tipoIdentificacion: (body.tipoIdentificacion as string) || "cedula",
      identificacion: (body.identificacion as string) || "",
      nombre: (body.nombre as string).trim(),
      email: (body.email as string) || "",
      telefono: (body.telefono as string) || "",
      direccion: (body.direccion as string) || "",
      ciudad: (body.ciudad as string) || "",
    },
    select: { id: true, tipoIdentificacion: true, identificacion: true, nombre: true, email: true, telefono: true, direccion: true, ciudad: true, activo: true, creadoEn: true },
  });

  return apiSuccess(cliente, 201);
}
