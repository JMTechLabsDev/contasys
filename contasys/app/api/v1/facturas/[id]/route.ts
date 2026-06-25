import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { authenticateApiRequest, apiSuccess, apiError } from "@/lib/api-auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request);
  if (!auth.authorized) return apiError(auth.status, auth.error, auth.code);

  const { id } = await params;

  const factura = await prisma.factura.findFirst({
    where: { id, empresaId: auth.empresaId },
    select: {
      id: true, numeroFactura: true, claveAcceso: true, tipoComprobante: true, estado: true,
      subtotal: true, descuento: true, subtotalSinImpuesto: true, iva: true, total: true,
      metodoPago: true, observaciones: true, fechaEmision: true, fechaAutorizacion: true,
      xmlGenerado: true, pdfUrl: true, sriRespuesta: true, creadoEn: true,
      cliente: { select: { id: true, nombre: true, identificacion: true, email: true } },
      facturaItems: { select: { id: true, descripcion: true, cantidad: true, precioUnitario: true, descuento: true, subtotal: true, iva: true, total: true } },
    },
  });

  if (!factura) return apiError(404, "Factura no encontrada", "NOT_FOUND");

  return apiSuccess(factura);
}
