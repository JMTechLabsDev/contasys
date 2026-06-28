import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get("authorization");
  const secretParam = searchParams.get("secret");
  const expected = process.env.CRON_SECRET;
  const autorizado = authHeader === `Bearer ${expected}` || secretParam === expected;
  if (!autorizado) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const hoy = new Date();
  const dia = hoy.getDate();
  const resultados: { recurrenciaId: string; success: boolean; facturaId?: string; error?: string }[] = [];

  const recurrencias = await prisma.recurrencia.findMany({
    where: {
      activa: true,
      diaEjecucion: dia,
      OR: [
        { proximaEjecucion: null },
        { proximaEjecucion: { lte: hoy } },
      ],
    },
    include: { items: true, empresa: true },
  });

  for (const r of recurrencias) {
    try {
      if (!r.items.length) {
        resultados.push({ recurrenciaId: r.id, success: false, error: "Sin items" });
        continue;
      }

      const ivaTarifa = 0.15;
      let subtotal = 0;
      let descuentoTotal = 0;

      const items = r.items.map((ri) => {
        const desc = Number(ri.descuento);
        const sub = Number(ri.cantidad) * Number(ri.precioUnitario) - desc;
        const iva = ri.impuesto === "15%" ? sub * ivaTarifa : 0;
        subtotal += Number(ri.cantidad) * Number(ri.precioUnitario);
        descuentoTotal += desc;
        return {
          descripcion: ri.descripcion,
          cantidad: ri.cantidad,
          precioUnitario: ri.precioUnitario,
          descuento: ri.descuento,
          subtotal: sub,
          iva,
          total: sub + iva,
          productoId: ri.productoId,
        };
      });

      const ultima = await prisma.factura.findFirst({
        where: { empresaId: r.empresaId, numeroFactura: { startsWith: "FAC-" } },
        orderBy: { numeroFactura: "desc" },
        select: { numeroFactura: true },
      });
      const num = ultima ? (parseInt(ultima.numeroFactura.replace("FAC-", ""), 10) || 0) + 1 : 1;

      const factura = await prisma.factura.create({
        data: {
          empresaId: r.empresaId,
          clienteId: r.clienteId,
          numeroFactura: `FAC-${String(num).padStart(4, "0")}`,
          recurrenciaId: r.id,
          tipoComprobante: "factura",
          estado: "borrador",
          subtotal,
          descuento: descuentoTotal,
          subtotalSinImpuesto: subtotal - descuentoTotal,
          iva: items.reduce((s, i) => s + Number(i.iva), 0),
          total: items.reduce((s, i) => s + Number(i.total), 0),
          metodoPago: r.metodoPago || undefined,
          observaciones: r.observaciones || undefined,
          facturaItems: {
            create: items.map((i) => ({
              descripcion: i.descripcion,
              cantidad: i.cantidad,
              precioUnitario: i.precioUnitario,
              descuento: i.descuento,
              subtotal: Number(i.subtotal),
              iva: Number(i.iva),
              total: Number(i.total),
              productoId: i.productoId || undefined,
            })),
          },
        },
      });

      const proxima = new Date(hoy);
      if (r.frecuencia === "mensual") {
        proxima.setMonth(proxima.getMonth() + 1);
      } else if (r.frecuencia === "anual") {
        proxima.setFullYear(proxima.getFullYear() + 1);
      } else if (r.frecuencia === "semanal") {
        proxima.setDate(proxima.getDate() + 7);
      }

      await prisma.recurrencia.update({
        where: { id: r.id },
        data: { ultimaEjecucion: hoy, proximaEjecucion: proxima },
      });

      resultados.push({ recurrenciaId: r.id, success: true, facturaId: factura.id });
    } catch (err) {
      resultados.push({
        recurrenciaId: r.id,
        success: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  }

  return NextResponse.json({ ejecutadas: resultados.length, resultados });
}
