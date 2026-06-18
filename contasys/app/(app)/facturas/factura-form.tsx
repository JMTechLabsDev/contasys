"use client";

import { useActionState, useState, useCallback } from "react";
import { crearFactura, type FacturaState } from "@/actions/factura";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Search } from "lucide-react";

type LineItem = {
  key: string;
  productoId: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  impuesto: "0%" | "15%" | "exento";
};

function createEmptyItem(): LineItem {
  return {
    key: Math.random().toString(36).slice(2),
    productoId: "",
    descripcion: "",
    cantidad: 1,
    precioUnitario: 0,
    descuento: 0,
    impuesto: "15%",
  };
}

function calcItem(item: LineItem) {
  const base = item.cantidad * item.precioUnitario;
  const desc = item.descuento * item.cantidad;
  const sub = Math.max(0, base - desc);
  const ivaPct = item.impuesto === "15%" ? 0.15 : 0;
  const iva = sub * ivaPct;
  return { subtotal: sub, iva, total: sub + iva };
}

export function FacturaForm({
  clientes,
  productos,
}: {
  clientes: Array<{ id: string; nombre: string; identificacion: string }>;
  productos: Array<{ id: string; nombre: string; precio: number; impuesto: string }>;
}) {
  const [state, formAction, pending] = useActionState<FacturaState | null, FormData>(crearFactura, null);
  const [items, setItems] = useState<LineItem[]>([createEmptyItem()]);
  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [showClientes, setShowClientes] = useState(false);

  const filteredClientes = clientes.filter(
    (c) => c.nombre.toLowerCase().includes(clienteSearch.toLowerCase()) || c.identificacion.includes(clienteSearch),
  );

  const addItem = () => setItems([...items, createEmptyItem()]);

  const removeItem = (key: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((i) => i.key !== key));
  };

  const updateItem = (key: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map((i) => (i.key === key ? { ...i, [field]: value } : i)));
  };

  const selectProducto = (key: string, prod: (typeof productos)[0]) => {
    setItems(
      items.map((i) =>
        i.key === key
          ? { ...i, productoId: prod.id, descripcion: prod.nombre, precioUnitario: Number(prod.precio), impuesto: prod.impuesto as "0%" | "15%" | "exento" }
          : i,
      ),
    );
  };

  const subtotal = items.reduce((s, i) => s + calcItem(i).subtotal, 0);
  const descuentoGlobal = 0;
  const ivaTotal = items.reduce((s, i) => s + calcItem(i).iva, 0);
  const totalFinal = subtotal - descuentoGlobal + ivaTotal;

  const formatMoney = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      if (!clienteId) {
        alert("Selecciona un cliente");
        e.preventDefault();
        return;
      }
      const itemsJson = JSON.stringify(
        items.map((i) => ({
          productoId: i.productoId,
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          descuento: i.descuento,
          impuesto: i.impuesto,
        })),
      );
      const form = e.currentTarget;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "items";
      input.value = itemsJson;
      form.appendChild(input);
    },
    [items, clienteId],
  );

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>
      )}

      <input type="hidden" name="clienteId" value={clienteId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 relative">
          <Label>Cliente</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={clienteSearch}
              onChange={(e) => { setClienteSearch(e.target.value); setShowClientes(true); }}
              onFocus={() => setShowClientes(true)}
              placeholder="Buscar cliente..."
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm"
            />
          </div>
          {showClientes && clienteSearch && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border bg-background shadow-lg max-h-48 overflow-y-auto">
              {filteredClientes.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">Sin resultados</p>
              ) : (
                filteredClientes.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setClienteId(c.id);
                      setClienteSearch(`${c.nombre} (${c.identificacion})`);
                      setShowClientes(false);
                    }}
                  >
                    <span className="font-medium">{c.nombre}</span>
                    <span className="text-muted-foreground ml-2 text-xs">{c.identificacion}</span>
                  </button>
                ))
              )}
            </div>
          )}
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
        <Input id="observaciones" name="observaciones" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Items</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar Item
          </Button>
        </div>

        {items.map((item, idx) => {
          const { subtotal: sub, iva: ivaItem, total: tot } = calcItem(item);
          return (
            <div key={item.key} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Producto / Descripción</Label>
                  {productos.length > 0 && (
                    <Select
                      value={item.productoId}
                      onValueChange={(val) => {
                        const prod = productos.find((p) => p.id === val);
                        if (prod) selectProducto(item.key, prod);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Seleccionar producto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {productos.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nombre} — {formatMoney(Number(p.precio))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Input
                    placeholder="O escribe la descripción manual"
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

              <div className="grid grid-cols-5 gap-2">
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
                <div>
                  <Label className="text-xs">IVA</Label>
                  <Select
                    value={item.impuesto}
                    onValueChange={(val) => updateItem(item.key, "impuesto", val ?? "15%")}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15%">15%</SelectItem>
                      <SelectItem value="0%">0%</SelectItem>
                      <SelectItem value="exento">Exento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-right">
                  <Label className="text-xs">Subtotal</Label>
                  <div className="h-8 flex items-center justify-end text-sm font-medium">
                    {formatMoney(sub)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border p-4 space-y-1 text-sm ml-auto w-72">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">IVA</span>
          <span>{formatMoney(ivaTotal)}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-1 border-t">
          <span>Total</span>
          <span>{formatMoney(totalFinal)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Crear Factura"}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
