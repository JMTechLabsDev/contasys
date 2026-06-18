"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { crearRecurrencia, type RecurrenciaActionState } from "@/actions/recurrencia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

type LineItem = {
  key: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
};

function createEmptyItem(): LineItem {
  return { key: Math.random().toString(36).slice(2), descripcion: "", cantidad: 1, precioUnitario: 0, descuento: 0 };
}

export function RecurrenteForm({
  clientes,
  productos,
}: {
  clientes: Array<{ id: string; nombre: string; identificacion: string }>;
  productos: Array<{ id: string; nombre: string; precio: number }>;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<RecurrenciaActionState | null, FormData>(crearRecurrencia, null);
  const [items, setItems] = useState<LineItem[]>([createEmptyItem()]);
  const [clienteId, setClienteId] = useState("");

  const addItem = () => setItems([...items, createEmptyItem()]);

  const removeItem = (key: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((i) => i.key !== key));
  };

  const updateItem = (key: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map((i) => (i.key === key ? { ...i, [field]: value } : i)));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!clienteId) {
      alert("Selecciona un cliente");
      e.preventDefault();
      return;
    }
    const itemsJson = JSON.stringify(items.map((i) => ({ descripcion: i.descripcion, cantidad: i.cantidad, precioUnitario: i.precioUnitario, descuento: i.descuento })));
    const form = e.currentTarget;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "items";
    input.value = itemsJson;
    form.appendChild(input);
  };

  if (state?.success) {
    router.push("/facturas/recurrentes");
    return null;
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>
      )}

      <input type="hidden" name="clienteId" value={clienteId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Cliente</Label>
          <Select value={clienteId} onValueChange={(v) => v !== null && setClienteId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente..." />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nombre} ({c.identificacion})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="frecuencia">Frecuencia</Label>
          <Select name="frecuencia" defaultValue="mensual">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensual">Mensual</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="diaEjecucion">Día de Ejecución</Label>
          <Input id="diaEjecucion" name="diaEjecucion" type="number" min={1} max={31} defaultValue={1} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metodoPago">Método de Pago</Label>
          <Select name="metodoPago" defaultValue="">
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin especificar</SelectItem>
              <SelectItem value="efectivo">Efectivo</SelectItem>
              <SelectItem value="transferencia">Transferencia</SelectItem>
              <SelectItem value="tarjeta">Tarjeta</SelectItem>
              <SelectItem value="credito">Crédito</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="otros">Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones (opcional)</Label>
        <Textarea id="observaciones" name="observaciones" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Items</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar Item
          </Button>
        </div>

        {items.map((item) => (
          <div key={item.key} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Descripción</Label>
                <Input
                  placeholder="Descripción del item"
                  className="h-8 text-xs"
                  value={item.descripcion}
                  onChange={(e) => updateItem(item.key, "descripcion", e.target.value)}
                  required
                />
              </div>
              <button type="button" onClick={() => removeItem(item.key)} className="mt-5 text-destructive hover:text-destructive/80">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Cant.</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="1"
                  className="h-8 text-xs"
                  value={item.cantidad}
                  onChange={(e) => updateItem(item.key, "cantidad", parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">P. Unit.</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="h-8 text-xs"
                  value={item.precioUnitario}
                  onChange={(e) => updateItem(item.key, "precioUnitario", parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Desc. c/u</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="h-8 text-xs"
                  value={item.descuento}
                  onChange={(e) => updateItem(item.key, "descuento", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Crear Recurrencia"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
