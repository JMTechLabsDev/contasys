import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { authenticateApiRequest, apiSuccess, apiError } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth.authorized) return apiError(auth.status, auth.error, auth.code);

  const { searchParams } = new URL(request.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const dateFilter: Record<string, unknown> = { empresaId: auth.empresaId, estado: "autorizado" };
  if (desde) dateFilter.fechaEmision = { ...((dateFilter.fechaEmision as object) || {}), gte: new Date(desde) };
  if (hasta) dateFilter.fechaEmision = { ...((dateFilter.fechaEmision as object) || {}), lte: new Date(hasta) };

  const reportes = await Promise.all([
    prisma.factura.aggregate({ where: dateFilter as any, _sum: { total: true, iva: true, subtotal: true }, _count: true }),
    prisma.cliente.count({ where: { empresaId: auth.empresaId, activo: true } }),
    prisma.producto.count({ where: { empresaId: auth.empresaId, activo: true } }),
    prisma.pago.aggregate({ where: { empresaId: auth.empresaId }, _sum: { monto: true } }),
  ]);

  return apiSuccess({
    resumen: {
      totalFacturado: reportes[0]._sum.total ?? 0,
      totalIva: reportes[0]._sum.iva ?? 0,
      totalSubtotal: reportes[0]._sum.subtotal ?? 0,
      cantidadFacturas: reportes[0]._count,
    },
    clientesActivos: reportes[1],
    productosActivos: reportes[2],
    totalCobrado: reportes[3]._sum.monto ?? 0,
  });
}
