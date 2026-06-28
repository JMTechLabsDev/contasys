import { prisma } from "@/lib/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, CreditCard, Users } from "lucide-react";

export default async function AdminFinanzasPage() {
  const [pagosSuscripcion, totalSuscripciones, activas, canceladas, empresas] = await Promise.all([
    prisma.pagoSuscripcion.findMany({
      orderBy: { creadoEn: "desc" },
      take: 50,
      select: { id: true, monto: true, moneda: true, paypalTransactionId: true, estado: true, creadoEn: true, suscripcion: { select: { empresa: { select: { nombre: true } } } } },
    }),
    prisma.suscripcion.count(),
    prisma.suscripcion.count({ where: { estado: "activa" } }),
    prisma.suscripcion.count({ where: { estado: "cancelada" } }),
    prisma.empresa.count(),
  ]);

  const mesActual = new Date();
  mesActual.setDate(1);
  const ingresosMes = await prisma.pagoSuscripcion.aggregate({ _sum: { monto: true }, where: { creadoEn: { gte: mesActual } } });
  const mrr = Number(ingresosMes._sum.monto ?? 0);
  const arr = mrr * 12;

  const mesAnterior = new Date(mesActual);
  mesAnterior.setMonth(mesAnterior.getMonth() - 1);
  const ingresosMesAnterior = await prisma.pagoSuscripcion.aggregate({ _sum: { monto: true }, where: { creadoEn: { gte: mesAnterior, lt: mesActual } } });
  const mrrAnterior = Number(ingresosMesAnterior._sum.monto ?? 0);
  const tasaCrecimiento = mrrAnterior > 0 ? ((mrr - mrrAnterior) / mrrAnterior * 100) : 0;

  const ingresosPorPlan = await prisma.suscripcion.groupBy({
    by: ["planId"],
    where: { estado: "activa" },
    _count: true,
  });

  const planes = await prisma.plan.findMany({ select: { id: true, nombre: true, precioMensual: true } });
  const ingresosPorPlanData = ingresosPorPlan.map((g) => {
    const plan = planes.find((p) => p.id === g.planId);
    return { plan: plan?.nombre || "Desconocido", count: g._count, ingresos: (g._count * Number(plan?.precioMensual ?? 0)).toFixed(2) };
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Gestión Financiera</h1>
        <p className="text-muted-foreground">Métricas financieras de la plataforma</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">MRR</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">${mrr.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">ARR</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold">${arr.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Suscripciones</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <div>
                <span className="text-2xl font-bold">{activas}</span>
                <span className="text-sm text-muted-foreground ml-1">/ {totalSuscripciones}</span>
                <p className="text-xs text-muted-foreground">{canceladas} canceladas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Crecimiento</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600" />
              <div>
                <span className={`text-2xl font-bold ${tasaCrecimiento >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {tasaCrecimiento >= 0 ? "+" : ""}{tasaCrecimiento.toFixed(1)}%
                </span>
                <p className="text-xs text-muted-foreground">vs mes anterior</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Ingresos por Plan</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Suscripciones</TableHead>
                  <TableHead>Ingreso mensual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingresosPorPlanData.map((item) => (
                  <TableRow key={item.plan}>
                    <TableCell className="font-medium">{item.plan}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>${item.ingresos}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Últimos pagos</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagosSuscripcion.slice(0, 10).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-sm">{p.suscripcion?.empresa?.nombre || "—"}</TableCell>
                    <TableCell>${parseFloat(p.monto.toString()).toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(p.creadoEn).toLocaleDateString("es-EC")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
