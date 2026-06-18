"use client";

import { useActionState, useState } from "react";
import { crearFacturaRapida } from "@/actions/factura";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Zap } from "lucide-react";

export function FacturaRapidaForm({
  clientes,
  productos,
}: {
  clientes: Array<{ id: string; nombre: string; identificacion: string }>;
  productos: Array<{ id: string; nombre: string; precio: number }>;
}) {
  const [state, formAction, pending] = useActionState(crearFacturaRapida, null);
  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [showClientes, setShowClientes] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [impuesto, setImpuesto] = useState("15%");
  const [metodoPago, setMetodoPago] = useState("efectivo");

  const filteredClientes = clientes.filter(
    (c) => c.nombre.toLowerCase().includes(clienteSearch.toLowerCase()) || c.identificacion.includes(clienteSearch),
  );

  const ivaPct = impuesto === "15%" ? 0.15 : 0;
  const subtotal = cantidad * precioUnitario;
  const iva = subtotal * ivaPct;
  const total = subtotal + iva;

  const selectProduct = (prod: (typeof productos)[0]) => {
    setDescripcion(prod.nombre);
    setPrecioUnitario(prod.precio);
  };

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state?.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>
      )}

      <input type="hidden" name="clienteId" value={clienteId} />
      <input type="hidden" name="descripcion" value={descripcion} />
      <input type="hidden" name="cantidad" value={cantidad} />
      <input type="hidden" name="precioUnitario" value={precioUnitario} />
      <input type="hidden" name="impuesto" value={impuesto} />
      <input type="hidden" name="metodoPago" value={metodoPago} />

      <div className="space-y-2 relative">
        <Label className="text-base font-semibold">Cliente</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={clienteSearch}
            onChange={(e) => { setClienteSearch(e.target.value); setShowClientes(true); }}
            onFocus={() => setShowClientes(true)}
            placeholder="Buscar cliente por nombre o identificación..."
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm"
            autoFocus
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

      <div className="rounded-lg border p-4 space-y-4">
        <Label className="text-base font-semibold">Item</Label>

        {productos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {productos.slice(0, 8).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectProduct(p)}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium hover:bg-accent transition-colors"
              >
                {p.nombre} — ${p.precio.toFixed(2)}
              </button>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <Label className="text-xs text-muted-foreground">Descripción</Label>
            <Input
              placeholder="Producto o servicio"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Cantidad</Label>
            <Input
              type="number"
              min="1"
              step="1"
              value={cantidad}
              onChange={(e) => setCantidad(parseFloat(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Precio Unit.</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={precioUnitario}
              onChange={(e) => setPrecioUnitario(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">IVA</Label>
            <Select value={impuesto} onValueChange={(v) => setImpuesto(v ?? "15%")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15%">15%</SelectItem>
                <SelectItem value="0%">0%</SelectItem>
                <SelectItem value="exento">Exento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Método de Pago</Label>
            <Select value={metodoPago} onValueChange={(v) => setMetodoPago(v ?? "efectivo")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="credito">Crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground">TOTAL</p>
          <p className="text-3xl font-bold text-primary">
            ${total.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            Subtotal: ${subtotal.toFixed(2)} | IVA: ${iva.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending} size="lg" className="gap-2">
          <Zap className="h-4 w-4" />
          {pending ? "Creando..." : "Crear Factura Rápida"}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
