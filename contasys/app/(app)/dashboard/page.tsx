import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { DollarSign, FileText, Users, CreditCard, TrendingUp, TrendingDown } from "lucide-react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopProductosTable } from "./top-productos-table";

const DashboardCharts = dynamic(() => import("./dashboard-charts").then((m) => m.DashboardCharts));
import { TipoCambioWidget } from "./tipo-cambio";
import { fetchExchangeRates } from "@/lib/exchange-rates";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const empresaUsuario = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true },
  });
  if (!empresaUsuario) redirect("/onboarding");

  const empresaId = empresaUsuario.empresaId;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    ventasHoy,
    ventasMes,
    ventasAnio,
    facturas,
    facturasPendientes,
    clientesActivos,
    clientesNuevosMes,
    cuentasCobrar,
    topProductos,
    ventasMensuales,
    clientesPorMes,
    facturacionPeriodo,
    exchangeRatesResult,
  ] = await Promise.all([
    prisma.factura.aggregate({
      where: { empresaId, estado: "autorizado", fechaEmision: { gte: startOfDay } },
      _sum: { total: true },
    }),
    prisma.factura.aggregate({
      where: { empresaId, estado: "autorizado", fechaEmision: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.factura.aggregate({
      where: { empresaId, estado: "autorizado", fechaEmision: { gte: startOfYear } },
      _sum: { total: true },
    }),
    prisma.factura.count({ where: { empresaId, estado: "autorizado" } }),
    prisma.factura.count({
      where: { empresaId, estado: { in: ["pendiente", "procesando", "borrador"] } },
    }),
    prisma.cliente.count({ where: { empresaId, activo: true } }),
    prisma.cliente.count({
      where: { empresaId, creadoEn: { gte: startOfMonth } },
    }),
    prisma.factura.aggregate({
      where: {
        empresaId,
        estado: { in: ["autorizado", "pendiente"] },
        pagos: { none: {} },
      },
      _sum: { total: true },
    }),
    prisma.facturaItem.groupBy({
      by: ["productoId"],
      where: {
        factura: { empresaId, estado: "autorizado" },
        productoId: { not: null },
      },
      _sum: { cantidad: true, total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
    prisma.$queryRaw<{ mes: number; total: number }[]>`
      SELECT EXTRACT(MONTH FROM fecha_emision)::int as mes, SUM(total)::decimal(10,2) as total
      FROM facturas
      WHERE empresa_id = ${empresaId}
        AND estado = 'autorizado'
        AND fecha_emision >= ${startOfYear}
      GROUP BY mes
      ORDER BY mes
    `,
    prisma.$queryRaw<{ mes: number; total: bigint }[]>`
      SELECT EXTRACT(MONTH FROM creado_en)::int as mes, COUNT(*)::bigint as total
      FROM clientes
      WHERE empresa_id = ${empresaId}
        AND creado_en >= ${startOfYear}
      GROUP BY mes
      ORDER BY mes
    `,
    prisma.$queryRaw<{ semana: number; total: number }[]>`
      SELECT
        EXTRACT(WEEK FROM fecha_emision)::int as semana,
        SUM(total)::decimal(10,2) as total
      FROM facturas
      WHERE empresa_id = ${empresaId}
        AND estado = 'autorizado'
        AND fecha_emision >= ${startOfMonth}
      GROUP BY semana
      ORDER BY semana
    `,
    fetchExchangeRates().catch(() => null),
  ]);

  const productoIds = topProductos.map((t) => t.productoId).filter(Boolean) as string[];
  const productosMap = productoIds.length > 0
    ? new Map(
        (await prisma.producto.findMany({ where: { id: { in: productoIds } } })).map((p) => [p.id, p]),
      )
    : new Map();

  const topProductosData = topProductos.map((t) => ({
    nombre: t.productoId ? (productosMap.get(t.productoId)?.nombre ?? "Producto eliminado") : "Producto eliminado",
    cantidad: Number(t._sum.cantidad ?? 0),
    total: Number(t._sum.total ?? 0),
  }));

  const chartVentas = Array.from({ length: 12 }, (_, i) => {
    const mes = ventasMensuales.find((v) => v.mes === i + 1);
    return { mes: meses[i], total: mes ? Number(mes.total) : 0 };
  });

  const chartClientes = Array.from({ length: 12 }, (_, i) => {
    const mes = clientesPorMes.find((v) => v.mes === i + 1);
    return { mes: meses[i], total: mes ? Number(mes.total) : 0 };
  });

  const chartPeriodo = facturacionPeriodo.map((f) => ({
    semana: `Sem ${f.semana}`,
    total: Number(f.total),
  }));

  const rates = exchangeRatesResult
    ? [
        { moneda: "Euro", codigo: "EUR", tasa: exchangeRatesResult.rates.EUR, bandera: "🇪🇺" },
        { moneda: "Peso Colombiano", codigo: "COP", tasa: exchangeRatesResult.rates.COP, bandera: "🇨🇴" },
        { moneda: "Sol Peruano", codigo: "PEN", tasa: exchangeRatesResult.rates.PEN, bandera: "🇵🇪" },
      ]
    : null;

  const formatMoney = (val: unknown) => {
    const n = val != null ? Number(val) : null;
    return n != null ? `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00";
  };
  const gtZero = (val: unknown) => val != null && Number(val) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu actividad comercial</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ventas Hoy"
          value={formatMoney(ventasHoy._sum.total)}
          icon={DollarSign}
          trend={gtZero(ventasHoy._sum.total) ? "up" : "neutral"}
        />
        <KpiCard
          title="Ventas del Mes"
          value={formatMoney(ventasMes._sum.total)}
          icon={TrendingUp}
          trend={gtZero(ventasMes._sum.total) ? "up" : "neutral"}
        />
        <KpiCard
          title="Ventas del Año"
          value={formatMoney(ventasAnio._sum.total)}
          icon={BarChartIcon}
          trend={gtZero(ventasAnio._sum.total) ? "up" : "neutral"}
        />
        <KpiCard
          title="Facturas Emitidas"
          value={facturas.toString()}
          icon={FileText}
          subtitle={`${facturasPendientes} pendientes`}
        />
        <KpiCard
          title="Clientes Activos"
          value={clientesActivos.toString()}
          icon={Users}
          subtitle={`${clientesNuevosMes} nuevos este mes`}
        />
        <KpiCard
          title="Cuentas por Cobrar"
          value={formatMoney(cuentasCobrar._sum.total)}
          icon={CreditCard}
          trend={gtZero(cuentasCobrar._sum.total) ? "down" : "neutral"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardCharts ventasMensuales={chartVentas} clientesPorMes={chartClientes} facturacionPeriodo={chartPeriodo} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopProductosTable productos={topProductosData} />
        </div>
        {rates && (
          <TipoCambioWidget rates={rates} ultimaActualizacion={exchangeRatesResult!.date} />
        )}
      </div>
    </div>
  );
}

const meses = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function KpiCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-1">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {trend === "up" && <TrendingUp className="h-4 w-4 text-emerald-500" />}
          {trend === "down" && <TrendingDown className="h-4 w-4 text-destructive" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
