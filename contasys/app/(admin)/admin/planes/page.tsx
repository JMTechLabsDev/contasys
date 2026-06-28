import { prisma } from "@/lib/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanForm } from "./plan-form";
import { PlanList } from "./plan-list";

export default async function AdminPlanesPage() {
  const planes = (await prisma.plan.findMany({ orderBy: { precioMensual: "asc" } })).map((p) => ({ ...p, precioMensual: p.precioMensual.toString(), precioAnual: p.precioAnual.toString() }));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Planes</h1>
        <p className="text-muted-foreground">{planes.length} planes configurados</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Crear nuevo plan</CardTitle></CardHeader>
          <CardContent><PlanForm /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Planes existentes</CardTitle></CardHeader>
          <CardContent><PlanList planes={planes} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
