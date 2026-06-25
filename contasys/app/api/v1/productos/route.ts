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
  const categoria = searchParams.get("categoria");

  const where: Record<string, unknown> = { empresaId: auth.empresaId, activo: true };
  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categoria) where.categoria = categoria;

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where: where as any,
      select: { id: true, sku: true, nombre: true, categoria: true, precio: true, costo: true, impuesto: true, stock: true, activo: true, creadoEn: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { nombre: "asc" },
    }),
    prisma.producto.count({ where: where as any }),
  ]);

  return apiPaginated(productos, total, page, limit);
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

  const producto = await prisma.producto.create({
    data: {
      empresaId: auth.empresaId,
      sku: (body.sku as string) || "",
      nombre: (body.nombre as string).trim(),
      descripcion: (body.descripcion as string) || "",
      categoria: (body.categoria as string) || "",
      precio: parseFloat(String(body.precio ?? 0)),
      costo: parseFloat(String(body.costo ?? 0)),
      impuesto: (body.impuesto as string) || "15%",
      stock: parseInt(String(body.stock ?? 0)),
    },
    select: { id: true, sku: true, nombre: true, categoria: true, precio: true, costo: true, impuesto: true, stock: true, activo: true, creadoEn: true },
  });

  return apiSuccess(producto, 201);
}
