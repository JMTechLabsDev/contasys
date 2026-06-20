"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, DollarSign, AlertTriangle, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { registrarPago } from "@/actions/pago";

type Cuenta = {
  id: string;
  numeroFactura: string;
  fechaEmision: Date;
  fechaVencimiento: Date | null;
  total: number;
  pagado: number;
  saldo: number;
  cliente: { id: string; nombre: string; identificacion: string };
};

type Props = {
  cuentas: Cuenta[];
  clientes: { id: string; nombre: string }[];
  filtros: { cliente?: string; desde?: string; hasta?: string; estado?: string };
};

function formatMoney(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function diasVencido(fecha: Date | null): number {
  if (!fecha) return 0;
  const diff = new Date().getTime() - new Date(fecha).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function PagoModal({ facturaId, saldo, facturaLabel, onClose }: { facturaId: string; saldo: number; facturaLabel: string; onClose: () => void }) {
  return (
    <form
      action={async (fd) => {
        fd.set("facturaId", facturaId);
        const res = await registrarPago(fd);
        if (res.success) onClose();
      }}
      className="space-y-4"
    >
      <p className="text-sm text-muted-foreground">
        {facturaLabel} — Saldo: {formatMoney(saldo)}
      </p>
      <input type="hidden" name="facturaId" value={facturaId} />
      <div>
        <label className="text-sm font-medium">Monto *</label>
        <Input type="number" name="monto" step="0.01" max={saldo} required placeholder="0.00" />
      </div>
      <div>
        <label className="text-sm font-medium">Método de pago</label>
        <Input name="metodo" placeholder="Efectivo / Transferencia / Tarjeta" />
      </div>
      <div>
        <label className="text-sm font-medium">Referencia</label>
        <Input name="referencia" placeholder="N° transferencia, cheque, etc." />
      </div>
      <div>
        <label className="text-sm font-medium">Fecha de pago</label>
        <Input type="date" name="fechaPago" defaultValue={new Date().toISOString().split("T")[0]} />
      </div>
      <Button type="submit" className="w-full">Registrar pago</Button>
    </form>
  );
}

export function CuentasCobrarContent({ cuentas, clientes, filtros }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pagoModal, setPagoModal] = useState<{ id: string; label: string; saldo: number } | null>(null);

  const totalPendiente = cuentas.reduce((s, c) => s + c.saldo, 0);
  const facturasVencidas = cuentas.filter((c) => c.saldo > 0 && diasVencido(c.fechaVencimiento) > 0);
  const facturasProximoVencer = cuentas.filter(
    (c) => c.saldo > 0 && c.fechaVencimiento && diasVencido(c.fechaVencimiento) === 0 && new Date(c.fechaVencimiento).getTime() - new Date().getTime() < 5 * 24 * 60 * 60 * 1000,
  );

  function setFilter(key: string, value: string) {
    const p = new URLSearchParams(sp.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`/cuentas-cobrar?${p.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cuentas por Cobrar</h1>
        <p className="text-2xl font-semibold">Total: {formatMoney(totalPendiente)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatMoney(totalPendiente)}</p>
            <p className="text-xs text-muted-foreground">{cuentas.length} facturas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximo a Vencer</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">{facturasProximoVencer.length}</p>
            <p className="text-xs text-muted-foreground">dentro de 5 días</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{facturasVencidas.length}</p>
            <p className="text-xs text-muted-foreground">
              {formatMoney(facturasVencidas.reduce((s, c) => s + c.saldo, 0))} en mora
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-muted-foreground">Buscar cliente</label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8 w-60"
              placeholder="Nombre o RUC..."
              defaultValue={filtros.cliente || ""}
              onBlur={(e) => setFilter("cliente", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setFilter("cliente", (e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Desde</label>
          <Input type="date" className="w-40" defaultValue={filtros.desde || ""} onChange={(e) => setFilter("desde", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Hasta</label>
          <Input type="date" className="w-40" defaultValue={filtros.hasta || ""} onChange={(e) => setFilter("hasta", e.target.value)} />
        </div>
        {(filtros.cliente || filtros.desde || filtros.hasta) && (
          <Button variant="ghost" onClick={() => router.push("/cuentas-cobrar")}>Limpiar filtros</Button>
        )}
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Factura</th>
              <th className="text-left p-3 font-medium">Cliente</th>
              <th className="text-left p-3 font-medium">Emisión</th>
              <th className="text-left p-3 font-medium">Vencimiento</th>
              <th className="text-right p-3 font-medium">Total</th>
              <th className="text-right p-3 font-medium">Pagado</th>
              <th className="text-right p-3 font-medium">Saldo</th>
              <th className="text-center p-3 font-medium">Estado</th>
              <th className="text-center p-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {cuentas.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-muted-foreground">
                  No hay cuentas por cobrar
                </td>
              </tr>
            )}
            {cuentas.map((c) => {
              const vencido = diasVencido(c.fechaVencimiento);
              const proximo = c.fechaVencimiento && !vencido && new Date(c.fechaVencimiento).getTime() - new Date().getTime() < 5 * 24 * 60 * 60 * 1000;
              const estadoPago = c.saldo <= 0 ? "pagado" : vencido > 0 ? "vencido" : proximo ? "proximo" : "aldia";
              const badgeColor =
                estadoPago === "pagado" ? "bg-emerald-100 text-emerald-700" :
                estadoPago === "vencido" ? "bg-red-100 text-red-700" :
                estadoPago === "proximo" ? "bg-amber-100 text-amber-700" :
                "bg-blue-100 text-blue-700";
              const badgeLabel =
                estadoPago === "pagado" ? "Pagado" :
                estadoPago === "vencido" ? `${vencido}d vencido` :
                estadoPago === "proximo" ? "Próximo" :
                "Al día";
              return (
                <tr key={c.id} className="border-b hover:bg-muted/30">
                  <td className="p-3">
                    <a href={`/facturas/${c.id}`} className="font-medium hover:underline">
                      {c.numeroFactura}
                    </a>
                  </td>
                  <td className="p-3">{c.cliente.nombre}</td>
                  <td className="p-3">{new Date(c.fechaEmision).toLocaleDateString()}</td>
                  <td className="p-3">
                    {c.fechaVencimiento ? new Date(c.fechaVencimiento).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-3 text-right">{formatMoney(c.total)}</td>
                  <td className="p-3 text-right">{formatMoney(c.pagado)}</td>
                  <td className="p-3 text-right font-semibold">{formatMoney(c.saldo)}</td>
                  <td className="p-3 text-center">
                    <Badge className={badgeColor}>{badgeLabel}</Badge>
                  </td>
                  <td className="p-3 text-center">
                    {c.saldo > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPagoModal({ id: c.id, label: c.numeroFactura, saldo: c.saldo })}
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Cobrar
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!pagoModal} onOpenChange={(open) => !open && setPagoModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          {pagoModal && (
            <PagoModal
              facturaId={pagoModal.id}
              saldo={pagoModal.saldo}
              facturaLabel={pagoModal.label}
              onClose={() => setPagoModal(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
