"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { crearPlan } from "@/actions/admin";

export function PlanForm() {
  const [state, formAction, pending] = useActionState(crearPlan, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre del plan</Label>
        <Input id="nombre" name="nombre" placeholder="Ej: Profesional" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="precioMensual">Precio mensual ($)</Label>
          <Input id="precioMensual" name="precioMensual" type="number" step="0.01" placeholder="29.99" required />
        </div>
        <div>
          <Label htmlFor="precioAnual">Precio anual ($)</Label>
          <Input id="precioAnual" name="precioAnual" type="number" step="0.01" placeholder="299.99" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="limiteFacturas">Límite facturas/mes (vacío = ilimitado)</Label>
          <Input id="limiteFacturas" name="limiteFacturas" type="number" placeholder="Ej: 100" />
        </div>
        <div>
          <Label htmlFor="limiteUsuarios">Límite usuarios (vacío = ilimitado)</Label>
          <Input id="limiteUsuarios" name="limiteUsuarios" type="number" placeholder="Ej: 5" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Características</Label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="multiempresa" /> Multiempresa</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="apiAccess" /> API Access</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="reportesAvanzados" /> Reportes avanzados</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="auditoria" /> Auditoría</label>
        </div>
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Creando..." : "Crear plan"}</Button>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Plan creado exitosamente</p>}
    </form>
  );
}
