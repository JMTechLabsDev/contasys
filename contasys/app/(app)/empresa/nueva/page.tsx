"use client";

import { useActionState } from "react";
import { crearNuevaEmpresa } from "@/actions/empresa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function NuevaEmpresaPage() {
  const [state, formAction, pending] = useActionState(crearNuevaEmpresa, null);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva Empresa</h1>
        <p className="text-muted-foreground">Crea una nueva empresa en tu cuenta</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Datos de la Empresa</CardTitle></CardHeader>
        <CardContent>
          <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Comercial</Label>
              <Input id="nombre" name="nombre" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="razonSocial">Razón Social</Label>
              <Input id="razonSocial" name="razonSocial" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC</Label>
              <Input id="ruc" name="ruc" required maxLength={13} placeholder="13 dígitos" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" name="telefono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input id="ciudad" name="ciudad" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provincia">Provincia</Label>
              <Input id="provincia" name="provincia" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" name="direccion" />
            </div>
            {state?.error && <p className="md:col-span-2 text-sm text-destructive">{state.error}</p>}
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={pending}>Crear Empresa</Button>
              <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
