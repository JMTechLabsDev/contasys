"use client";

import { useActionState, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { crearGuiaRemision, type GuiaState } from "@/actions/guia-remision";
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
};

function createEmptyItem(): LineItem {
  return { key: Math.random().toString(36).slice(2), descripcion: "", cantidad: 1 };
}

export default function NuevaGuiaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const facturaReferenciaId = searchParams.get("facturaId") || "";

  const [state, formAction, pending] = useActionState<GuiaState | null, FormData>(crearGuiaRemision, null);
  const [clienteId, setClienteId] = useState("");
  const [items, setItems] = useState<LineItem[]>([createEmptyItem()]);

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
    const itemsJson = JSON.stringify(items.map((i) => ({ descripcion: i.descripcion, cantidad: i.cantidad })));
    const form = e.currentTarget;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "items";
    input.value = itemsJson;
    form.appendChild(input);
  };

  if (state?.success) {
    router.push("/facturas/guias");
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nueva Guía de Remisión</h1>
        <p className="text-muted-foreground">Registra una guía de remisión para el transporte de mercadería</p>
      </div>

      <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
        {state?.error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>
        )}

        <input type="hidden" name="clienteId" value={clienteId} />
        {facturaReferenciaId && <input type="hidden" name="facturaReferenciaId" value={facturaReferenciaId} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={(v) => v && setClienteId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cliente_temp">Cliente de prueba</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="puntoPartida">Punto de Partida</Label>
            <Input id="puntoPartida" name="puntoPartida" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="puntoDestino">Punto de Destino</Label>
            <Input id="puntoDestino" name="puntoDestino" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="transportistaNombre">Transportista</Label>
            <Input id="transportistaNombre" name="transportistaNombre" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transportistaRuc">RUC Transportista</Label>
            <Input id="transportistaRuc" name="transportistaRuc" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="placa">Placa</Label>
            <Input id="placa" name="placa" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fechaInicioTransporte">Fecha Inicio Transporte</Label>
          <Input id="fechaInicioTransporte" name="fechaInicioTransporte" type="date" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="destinatarioNombre">Destinatario</Label>
            <Input id="destinatarioNombre" name="destinatarioNombre" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destinatarioRuc">RUC Destinatario</Label>
            <Input id="destinatarioRuc" name="destinatarioRuc" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destinatarioDireccion">Dirección Destinatario</Label>
            <Input id="destinatarioDireccion" name="destinatarioDireccion" />
          </div>
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
                <div className="w-24">
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
                <button type="button" onClick={() => removeItem(item.key)} className="mt-5 text-destructive hover:text-destructive/80">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="observaciones">Observaciones (opcional)</Label>
          <Textarea id="observaciones" name="observaciones" />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : "Crear Guía"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
