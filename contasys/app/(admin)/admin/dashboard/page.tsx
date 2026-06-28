import { prisma } from "@/lib/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, CreditCard, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

function KpiCard({ title, value, icon: Icon, subtitle, trend }: { title: string; value: string; icon: React.ComponentType<{ className?: string }>; subtitle?: string; trend?: "up" | "down" }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{trend === "up" ? "Crecimiento positivo" : "Requiere atención"}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const [
    totalUsuarios,
    totalEmpresas,
    totalPlanes,
    suscripcionesActivas,
    suscripcionesPendientes,
    totalSuscripciones,
    ingresosMensuales,
    ultimosUsuarios,
    ultimasEmpresas,
  ] = await Promise.all([
    prisma.usuario.count(),
    prisma.empresa.count(),
    prisma.plan.count({ where: { activo: true } }),
    prisma.suscripcion.count({ where: { estado: "activa" } }),
    prisma.suscripcion.count({ where: { estado: "pendiente_cambio" } }),
    prisma.suscripcion.count(),
    prisma.pagoSuscripcion.aggregate({ _sum: { monto: true }, where: { creadoEn: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
    prisma.usuario.findMany({ orderBy: { creadoEn: "desc" }, take: 5, select: { id: true, nombre: true, email: true, creadoEn: true, rolPlataforma: true } }),
    prisma.empresa.findMany({ orderBy: { creadoEn: "desc" }, take: 5, select: { id: true, nombre: true, ruc: true, estado: true, creadoEn: true } }),
  ]);

  const mrr = Number(ingresosMensuales._sum.monto ?? 0);
  const arr = mrr * 12;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Panel Administrativo</h1>
        <p className="text-muted-foreground">KPIs globales de la plataforma ContaSys</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Usuarios Registrados" value={totalUsuarios.toLocaleString("es-EC")} icon={Users} subtitle={`${ultimosUsuarios.length} recientes`} />
        <KpiCard title="Empresas" value={totalEmpresas.toLocaleString("es-EC")} icon={Building2} subtitle={`${ultimasEmpresas.length} últimas creadas`} />
        <KpiCard title="Suscripciones Activas" value={suscripcionesActivas.toLocaleString("es-EC")} icon={CreditCard} subtitle={`${suscripcionesPendientes} pendientes de cambio`} trend="up" />
        <KpiCard title="MRR (Ingreso Mensual)" value={`$${mrr.toFixed(2)}`} icon={DollarSign} subtitle={`ARR: $${arr.toFixed(2)}`} trend={mrr > 0 ? "up" : "down"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Últimos Usuarios</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ultimosUsuarios.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{u.nombre}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(u.creadoEn).toLocaleDateString("es-EC")}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Últimas Empresas</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ultimasEmpresas.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{e.nombre}</p>
                    <p className="text-xs text-muted-foreground">{e.ruc}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{e.estado} · {new Date(e.creadoEn).toLocaleDateString("es-EC")}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
