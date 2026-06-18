"use client";

import { useActionState } from "react";
import { crearCliente, editarCliente, type ClienteState } from "@/actions/cliente";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ClienteForm({
  defaultValues,
  isEditing,
}: {
  defaultValues?: {
    id: string;
    tipoIdentificacion: string;
    identificacion: string;
    nombre: string;
    razonSocial: string | null;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    ciudad: string | null;
    provincia: string | null;
  };
  isEditing?: boolean;
}) {
  const action = isEditing ? editarCliente : crearCliente;
  const [state, formAction, pending] = useActionState<ClienteState | null, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {isEditing && defaultValues && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tipoIdentificacion">Tipo Identificación</Label>
          <Select
            name="tipoIdentificacion"
            defaultValue={defaultValues?.tipoIdentificacion || "cedula"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cedula">Cédula</SelectItem>
              <SelectItem value="ruc">RUC</SelectItem>
              <SelectItem value="pasaporte">Pasaporte</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="identificacion">Identificación</Label>
          <Input
            id="identificacion"
            name="identificacion"
            defaultValue={defaultValues?.identificacion}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre / Razón Social</Label>
          <Input
            id="nombre"
            name="nombre"
            defaultValue={defaultValues?.nombre}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="razonSocial">Razón Social (opcional)</Label>
          <Input
            id="razonSocial"
            name="razonSocial"
            defaultValue={defaultValues?.razonSocial || ""}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultValues?.email || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            name="telefono"
            defaultValue={defaultValues?.telefono || ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="direccion">Dirección</Label>
        <Input
          id="direccion"
          name="direccion"
          defaultValue={defaultValues?.direccion || ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ciudad">Ciudad</Label>
          <Input
            id="ciudad"
            name="ciudad"
            defaultValue={defaultValues?.ciudad || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="provincia">Provincia</Label>
          <Input
            id="provincia"
            name="provincia"
            defaultValue={defaultValues?.provincia || ""}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Cliente"}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
