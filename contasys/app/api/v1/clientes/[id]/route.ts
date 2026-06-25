import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { authenticateApiRequest, apiSuccess, apiError } from "@/lib/api-auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request);
  if (!auth.authorized) return apiError(auth.status, auth.error, auth.code);

  const { id } = await params;

  const cliente = await prisma.cliente.findFirst({
    where: { id, empresaId: auth.empresaId, activo: true },
    select: { id: true, tipoIdentificacion: true, identificacion: true, nombre: true, email: true, telefono: true, direccion: true, ciudad: true, provincia: true, activo: true, creadoEn: true },
  });

  if (!cliente) return apiError(404, "Cliente no encontrado", "NOT_FOUND");

  return apiSuccess(cliente);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request);
  if (!auth.authorized) return apiError(auth.status, auth.error, auth.code);

  const { id } = await params;

  const existente = await prisma.cliente.findFirst({ where: { id, empresaId: auth.empresaId } });
  if (!existente) return apiError(404, "Cliente no encontrado", "NOT_FOUND");

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "Cuerpo de la solicitud inválido", "INVALID_JSON");
  }

  const data: Record<string, unknown> = {};
  if (body.nombre !== undefined) data.nombre = (body.nombre as string).trim();
  if (body.tipoIdentificacion !== undefined) data.tipoIdentificacion = body.tipoIdentificacion as string;
  if (body.identificacion !== undefined) data.identificacion = body.identificacion as string;
  if (body.email !== undefined) data.email = body.email as string;
  if (body.telefono !== undefined) data.telefono = body.telefono as string;
  if (body.direccion !== undefined) data.direccion = body.direccion as string;
  if (body.ciudad !== undefined) data.ciudad = body.ciudad as string;

  if (Object.keys(data).length === 0) {
    return apiError(400, "No hay campos para actualizar", "VALIDATION_ERROR");
  }

  const cliente = await prisma.cliente.update({
    where: { id },
    data,
    select: { id: true, tipoIdentificacion: true, identificacion: true, nombre: true, email: true, telefono: true, direccion: true, ciudad: true, provincia: true, activo: true, creadoEn: true },
  });

  return apiSuccess(cliente);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request);
  if (!auth.authorized) return apiError(auth.status, auth.error, auth.code);

  const { id } = await params;

  const existente = await prisma.cliente.findFirst({ where: { id, empresaId: auth.empresaId } });
  if (!existente) return apiError(404, "Cliente no encontrado", "NOT_FOUND");

  await prisma.cliente.update({
    where: { id },
    data: { activo: false },
  });

  return apiSuccess(null, 204);
}
