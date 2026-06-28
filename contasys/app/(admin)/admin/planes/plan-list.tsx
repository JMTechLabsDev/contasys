"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { togglePlanActivo, actualizarPlan } from "@/actions/admin";
import { Power, CheckCircle, XCircle } from "lucide-react";

type PlanItem = {
  id: string; nombre: string; precioMensual: string; precioAnual: string;
  limiteFacturas: number | null; limiteUsuarios: number | null;
  multiempresa: boolean; apiAccess: boolean; reportesAvanzados: boolean; auditoria: boolean;
  activo: boolean; paypalPlanIdMensual: string | null; paypalPlanIdAnual: string | null;
};

export function PlanList({ planes }: { planes: PlanItem[] }) {
  const [, formActionToggle] = useActionState(togglePlanActivo, null);
  const [editState, formActionEdit] = useActionState(actualizarPlan, null);

  return (
    <div className="space-y-3">
      {planes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay planes creados</p>
      ) : (
        planes.map((plan) => (
          <Card key={plan.id} className={plan.activo ? "" : "opacity-60"}>
            <CardContent className="p-4">
              <form action={formActionEdit} className="space-y-3">
                <input type="hidden" name="id" value={plan.id} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={plan.activo ? "default" : "secondary"}>{plan.activo ? "Activo" : "Inactivo"}</Badge>
                    <span className="font-medium">{plan.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">${parseFloat(plan.precioMensual).toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">/mes</span>
                    <form action={formActionToggle}>
                      <input type="hidden" name="id" value={plan.id} />
                      <Button variant="ghost" size="icon-xs" title={plan.activo ? "Desactivar" : "Activar"}>
                        {plan.activo ? <XCircle className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                      </Button>
                    </form>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <Label>Límite facturas</Label>
                    <Input name="limiteFacturas" defaultValue={plan.limiteFacturas ?? ""} type="number" className="h-7 text-xs" />
                  </div>
                  <div>
                    <Label>Límite usuarios</Label>
                    <Input name="limiteUsuarios" defaultValue={plan.limiteUsuarios ?? ""} type="number" className="h-7 text-xs" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <label className="flex items-center gap-1"><input type="checkbox" name="multiempresa" defaultChecked={plan.multiempresa} /> Multi</label>
                  <label className="flex items-center gap-1"><input type="checkbox" name="apiAccess" defaultChecked={plan.apiAccess} /> API</label>
                  <label className="flex items-center gap-1"><input type="checkbox" name="reportesAvanzados" defaultChecked={plan.reportesAvanzados} /> Reportes</label>
                  <label className="flex items-center gap-1"><input type="checkbox" name="auditoria" defaultChecked={plan.auditoria} /> Auditoría</label>
                </div>
                <Button type="submit" variant="outline" size="sm">Guardar cambios</Button>
              </form>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground mb-0.5">{children}</p>;
}
