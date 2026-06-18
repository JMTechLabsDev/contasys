"use client";

import { useActionState } from "react";
import { crearProducto, editarProducto, type ProductoState } from "@/actions/producto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIAS } from "@/lib/validations/producto";

export function ProductoForm({
  defaultValues,
  isEditing,
}: {
  defaultValues?: {
    id: string;
    nombre: string;
    sku: string | null;
    descripcion: string | null;
    categoria: string | null;
    precio: number;
    costo: number | null;
    impuesto: string;
    stock: number | null;
  };
  isEditing?: boolean;
}) {
  const action = isEditing ? editarProducto : crearProducto;
  const [state, formAction, pending] = useActionState<ProductoState | null, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>
      )}

      {isEditing && defaultValues && <input type="hidden" name="id" value={defaultValues.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del Producto / Servicio</Label>
          <Input id="nombre" name="nombre" defaultValue={defaultValues?.nombre} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU (opcional)</Label>
          <Input id="sku" name="sku" defaultValue={defaultValues?.sku || ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción (opcional)</Label>
        <Input id="descripcion" name="descripcion" defaultValue={defaultValues?.descripcion || ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoría</Label>
          <Select name="categoria" defaultValue={defaultValues?.categoria || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin categoría</SelectItem>
              {CATEGORIAS.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="impuesto">Impuesto</Label>
          <Select name="impuesto" defaultValue={defaultValues?.impuesto || "15%"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15%">IVA 15%</SelectItem>
              <SelectItem value="0%">IVA 0%</SelectItem>
              <SelectItem value="exento">Exento de IVA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="precio">Precio ($)</Label>
          <Input id="precio" name="precio" type="number" step="0.01" min="0" defaultValue={defaultValues?.precio} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="costo">Costo ($) (opcional)</Label>
          <Input id="costo" name="costo" type="number" step="0.01" min="0" defaultValue={defaultValues?.costo ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock (opcional)</Label>
          <Input id="stock" name="stock" type="number" min="0" defaultValue={defaultValues?.stock ?? ""} />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Producto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
