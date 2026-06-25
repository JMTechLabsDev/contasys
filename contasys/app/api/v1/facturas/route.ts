import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { authenticateApiRequest, apiSuccess, apiError, apiPaginated } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth.authorized) return apiError(auth.status, auth.error, auth.code);

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
  const estado = searchParams.get("estado");
  const tipo = searchParams.get("tipo");
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const where: Record<string, unknown> = { empresaId: auth.empresaId };
  if (estado) where.estado = estado;
  if (tipo) where.tipoComprobante = tipo;
  if (desde) where.fechaEmision = { ...((where.fechaEmision as object) || {}), gte: new Date(desde) };
  if (hasta) where.fechaEmision = { ...((where.fechaEmision as object) || {}), lte: new Date(hasta) };

  const [facturas, total] = await Promise.all([
    prisma.factura.findMany({
      where: where as any,
      select: { id: true, numeroFactura: true, tipoComprobante: true, estado: true, subtotal: true, iva: true, total: true, fechaEmision: true, cliente: { select: { nombre: true, identificacion: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { creadoEn: "desc" },
    }),
    prisma.factura.count({ where: where as any }),
  ]);

  return apiPaginated(facturas, total, page, limit);
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

  if (!body.clienteId || typeof body.clienteId !== "string") {
    return apiError(400, "clienteId es requerido", "VALIDATION_ERROR");
  }

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return apiError(400, "items es requerido (array no vacío)", "VALIDATION_ERROR");
  }

  const clienteValido = await prisma.cliente.findFirst({ where: { id: body.clienteId as string, empresaId: auth.empresaId } });
  if (!clienteValido) return apiError(400, "Cliente no válido", "INVALID_CLIENTE");

  const ultimaFactura = await prisma.factura.findFirst({
    where: { empresaId: auth.empresaId, tipoComprobante: "factura" },
    orderBy: { creadoEn: "desc" },
  });
  const num = ultimaFactura ? (parseInt(ultimaFactura.numeroFactura.replace("FAC-", ""), 10) || 0) + 1 : 1;
  const numeroFactura = `FAC-${String(num).padStart(4, "0")}`;

  let subtotal = 0, descuento = 0, iva = 0;
  for (const item of body.items as any[]) {
    const qty = parseFloat(String(item.cantidad ?? 1));
    const precio = parseFloat(String(item.precioUnitario ?? 0));
    const dto = parseFloat(String(item.descuento ?? 0));
    const itemSubtotal = +(qty * precio).toFixed(2);
    const itemDescuento = +((itemSubtotal * dto) / 100).toFixed(2);
    const itemSinImpuesto = +(itemSubtotal - itemDescuento).toFixed(2);
    const itemIva = +((itemSinImpuesto * 15) / 100).toFixed(2);
    const itemTotal = +(itemSinImpuesto + itemIva).toFixed(2);
    subtotal += itemSubtotal;
    descuento += itemDescuento;
    iva += itemIva;
    item.subtotalCalculado = itemSubtotal;
    item.descuentoCalculado = itemDescuento;
    item.ivaCalculado = itemIva;
    item.totalCalculado = itemTotal;
  }

  const total = +(subtotal - descuento + iva).toFixed(2);
  subtotal = +subtotal.toFixed(2);
  descuento = +descuento.toFixed(2);
  iva = +iva.toFixed(2);

  const factura = await prisma.factura.create({
    data: {
      empresaId: auth.empresaId,
      clienteId: body.clienteId as string,
      numeroFactura,
      tipoComprobante: "factura",
      estado: "borrador",
      subtotal,
      descuento,
      iva,
      total,
      subtotalSinImpuesto: +(subtotal - descuento).toFixed(2),
      metodoPago: (body.metodoPago as string) || undefined,
      observaciones: (body.observaciones as string) || undefined,
      facturaItems: {
        create: (body.items as any[]).map((i: any) => ({
          descripcion: i.descripcion || "Producto",
          cantidad: parseFloat(String(i.cantidad ?? 1)),
          precioUnitario: parseFloat(String(i.precioUnitario ?? 0)),
          descuento: i.descuentoCalculado,
          subtotal: i.subtotalCalculado,
          iva: i.ivaCalculado,
          total: i.totalCalculado,
        })),
      },
    },
    select: { id: true, numeroFactura: true, tipoComprobante: true, estado: true, subtotal: true, iva: true, total: true, fechaEmision: true, creadoEn: true },
  });

  return apiSuccess(factura, 201);
}
