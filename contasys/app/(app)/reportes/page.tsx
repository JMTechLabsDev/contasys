import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { cookies } from "next/headers";

const ReportesContent = dynamic(() => import("./reportes-content").then((m) => m.ReportesContent));

export default async function ReportesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get("empresa_activa")?.value;
  const eu = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true, ...(empresaActivaId ? { empresaId: empresaActivaId } : {}) },
  });
  if (!eu) redirect("/onboarding");

  const eid = eu.empresaId;
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [ventasDiarias, ventasMensuales, topClientes, clientesInactivos, ticketData, rentabilidad, ivaData, retencionesData] = await Promise.all([
    prisma.$queryRaw<{ fecha: string; total: number; count: bigint }[]>`
      SELECT fecha_emision::date::text as fecha, SUM(total)::decimal(10,2) as total, COUNT(*)::bigint as count
      FROM facturas WHERE empresa_id = ${eid} AND estado = 'autorizado' AND fecha_emision >= ${startOfYear}
      GROUP BY fecha_emision::date ORDER BY fecha DESC LIMIT 90`,
    prisma.$queryRaw<{ mes: string; total: number; count: bigint }[]>`
      SELECT to_char(fecha_emision, 'YYYY-MM') as mes, SUM(total)::decimal(10,2) as total, COUNT(*)::bigint as count
      FROM facturas WHERE empresa_id = ${eid} AND estado = 'autorizado' AND fecha_emision >= ${startOfYear}
      GROUP BY mes ORDER BY mes`,
    prisma.$queryRaw<{ cliente: string; total: number; count: bigint }[]>`
      SELECT c.nombre as cliente, SUM(f.total)::decimal(10,2) as total, COUNT(*)::bigint as count
      FROM facturas f JOIN clientes c ON c.id = f.cliente_id
      WHERE f.empresa_id = ${eid} AND f.estado = 'autorizado'
      GROUP BY c.nombre ORDER BY total DESC LIMIT 10`,
    prisma.cliente.findMany({
      where: { empresaId: eid, activo: true },
      select: { id: true, nombre: true, identificacion: true, email: true, telefono: true, creadoEn: true },
    }),
    prisma.$queryRaw<{ total: number; count: bigint }[]>`
      SELECT SUM(total)::decimal(10,2) as total, COUNT(*)::bigint as count
      FROM facturas WHERE empresa_id = ${eid} AND estado = 'autorizado' AND fecha_emision >= ${startOfYear}`,
    prisma.$queryRaw<{ producto: string; vendido: bigint; ingresos: number; costo: number; rentabilidad: number }[]>`
      SELECT p.nombre as producto, SUM(fi.cantidad)::bigint as vendido,
        COALESCE(SUM(fi.total)::decimal(10,2), 0) as ingresos,
        COALESCE(SUM(fi.cantidad * p.costo)::decimal(10,2), 0) as costo,
        COALESCE(SUM(fi.total - fi.cantidad * p.costo)::decimal(10,2), 0) as rentabilidad
      FROM factura_items fi JOIN facturas f ON f.id = fi.factura_id
        JOIN productos p ON p.id = fi.producto_id
      WHERE f.empresa_id = ${eid} AND f.estado = 'autorizado' AND f.fecha_emision >= ${startOfYear}
      GROUP BY p.nombre ORDER BY vendido DESC LIMIT 20`,
    prisma.$queryRaw<{ mes: string; base: number; iva: number }[]>`
      SELECT to_char(fecha_emision, 'YYYY-MM') as mes,
        SUM(subtotal_sin_impuesto)::decimal(10,2) as base, SUM(iva)::decimal(10,2) as iva
      FROM facturas WHERE empresa_id = ${eid} AND estado = 'autorizado' AND fecha_emision >= ${startOfYear}
      GROUP BY mes ORDER BY mes`,
    prisma.factura.findMany({
      where: { empresaId: eid, tipoComprobante: "retencion", estado: "autorizado" },
      select: { numeroFactura: true, fechaEmision: true, total: true, valorRetenido: true, impuestoRetenido: true, baseImponibleRet: true, cliente: { select: { nombre: true, identificacion: true } } },
      orderBy: { fechaEmision: "desc" },
      take: 100,
    }),
  ]);

  const formatMoney = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const ticketPromedio = ticketData[0]?.count > 0 ? Number(ticketData[0].total) / Number(ticketData[0].count) : 0;
  const totalVentas = Number(ticketData[0]?.total || 0);

  const ventasAnuales = ventasDiarias.slice(0, 365);
  const ventasSemanales = await prisma.$queryRaw<{ semana: string; total: number; count: bigint }[]>`
    SELECT to_char(fecha_emision, 'IYYY-IW') as semana, SUM(total)::decimal(10,2) as total, COUNT(*)::bigint as count
    FROM facturas WHERE empresa_id = ${eid} AND estado = 'autorizado' AND fecha_emision >= ${startOfYear}
    GROUP BY semana ORDER BY semana`;

  return (
    <ReportesContent
      ventasDiarias={ventasDiarias.map(r => ({ fecha: r.fecha, total: Number(r.total), count: Number(r.count) }))}
      ventasSemanales={ventasSemanales.map(r => ({ semana: r.semana, total: Number(r.total), count: Number(r.count) }))}
      ventasMensuales={ventasMensuales.map(r => ({ mes: r.mes, total: Number(r.total), count: Number(r.count) }))}
      ventasAnuales={ventasAnuales.map(r => ({ fecha: r.fecha, total: Number(r.total), count: Number(r.count) }))}
      topClientes={topClientes.map(r => ({ nombre: r.cliente, total: Number(r.total), count: Number(r.count) }))}
      clientesInactivos={clientesInactivos.sort((a, b) => a.creadoEn.getTime() - b.creadoEn.getTime())}
      ticketPromedio={ticketPromedio}
      totalVentas={totalVentas}
      rentabilidad={rentabilidad.map(r => ({ producto: r.producto, vendido: Number(r.vendido), ingresos: Number(r.ingresos), rentabilidad: Number(r.rentabilidad) }))}
      ivaMensual={ivaData.map(r => ({ mes: r.mes, base: Number(r.base), iva: Number(r.iva) }))}
      retenciones={retencionesData}
      formatMoney={formatMoney}
    />
  );
}
