import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { authenticateApiRequest, apiSuccess, apiError } from "@/lib/api-auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request);
  if (!auth.authorized) return apiError(auth.status, auth.error, auth.code);

  const { id } = await params;

  const producto = await prisma.producto.findFirst({
    where: { id, empresaId: auth.empresaId, activo: true },
    select: { id: true, sku: true, nombre: true, descripcion: true, categoria: true, precio: true, costo: true, impuesto: true, stock: true, activo: true, creadoEn: true },
  });

  if (!producto) return apiError(404, "Producto no encontrado", "NOT_FOUND");

  return apiSuccess(producto);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request);
  if (!auth.authorized) return apiError(auth.status, auth.error, auth.code);

  const { id } = await params;

  const existente = await prisma.producto.findFirst({ where: { id, empresaId: auth.empresaId } });
  if (!existente) return apiError(404, "Producto no encontrado", "NOT_FOUND");

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "Cuerpo de la solicitud inválido", "INVALID_JSON");
  }

  const data: Record<string, unknown> = {};
  if (body.nombre !== undefined) data.nombre = (body.nombre as string).trim();
  if (body.sku !== undefined) data.sku = body.sku as string;
  if (body.descripcion !== undefined) data.descripcion = body.descripcion as string;
  if (body.categoria !== undefined) data.categoria = body.categoria as string;
  if (body.precio !== undefined) data.precio = parseFloat(String(body.precio));
  if (body.costo !== undefined) data.costo = parseFloat(String(body.costo));
  if (body.impuesto !== undefined) data.impuesto = body.impuesto as string;
  if (body.stock !== undefined) data.stock = parseInt(String(body.stock));

  if (Object.keys(data).length === 0) {
    return apiError(400, "No hay campos para actualizar", "VALIDATION_ERROR");
  }

  const producto = await prisma.producto.update({
    where: { id },
    data,
    select: { id: true, sku: true, nombre: true, descripcion: true, categoria: true, precio: true, costo: true, impuesto: true, stock: true, activo: true, creadoEn: true },
  });

  return apiSuccess(producto);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request);
  if (!auth.authorized) return apiError(auth.status, auth.error, auth.code);

  const { id } = await params;

  const existente = await prisma.producto.findFirst({ where: { id, empresaId: auth.empresaId } });
  if (!existente) return apiError(404, "Producto no encontrado", "NOT_FOUND");

  await prisma.producto.update({
    where: { id },
    data: { activo: false },
  });

  return apiSuccess(null, 204);
}
