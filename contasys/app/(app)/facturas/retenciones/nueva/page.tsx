"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getClientes, crearRetencion, type RetencionState } from "@/actions/retencion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type Cliente = { id: string; nombre: string; identificacion: string };

export default function NuevaRetencionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const facturaReferenciaId = searchParams.get("facturaId") || "";

  const [state, formAction, pending] = useActionState<RetencionState | null, FormData>(crearRetencion, null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [impuesto, setImpuesto] = useState("");
  const [porcentaje, setPorcentaje] = useState("");
  const [base, setBase] = useState("");

  const valorRetenido = ((parseFloat(base) || 0) * (parseFloat(porcentaje) || 0)) / 100;

  useEffect(() => {
    getClientes().then(setClientes).catch(() => {});
  }, []);

  if (state?.success) {
    router.push("/facturas/retenciones");
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nueva Retención</h1>
        <p className="text-muted-foreground">Registra una retención de impuesto</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>
            )}

            <input type="hidden" name="clienteId" value={clienteId} />
            <input type="hidden" name="impuestoRetenido" value={impuesto} />
            {facturaReferenciaId && <input type="hidden" name="facturaReferenciaId" value={facturaReferenciaId} />}

            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={(v) => v && setClienteId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre} ({c.identificacion})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ejercicioFiscal">Ejercicio Fiscal</Label>
                <Input id="ejercicioFiscal" name="ejercicioFiscal" type="number" defaultValue={new Date().getFullYear()} required />
              </div>
              <div className="space-y-2">
                <Label>Impuesto Retenido</Label>
                <Select value={impuesto} onValueChange={(v) => v && setImpuesto(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar impuesto..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IVA">IVA</SelectItem>
                    <SelectItem value="ISR">ISR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Porcentaje a Retener</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[1, 2, 8, 10, 30].map((pct) => (
                  <Button
                    key={pct}
                    type="button"
                    variant={porcentaje === String(pct) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPorcentaje(String(pct))}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>
              <Input
                name="porcentajeRetener"
                type="number"
                step="0.01"
                min="0"
                placeholder="O ingresa un valor personalizado"
                value={porcentaje}
                onChange={(e) => setPorcentaje(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="baseImponibleRet">Base Imponible</Label>
                <Input
                  id="baseImponibleRet"
                  name="baseImponibleRet"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Valor Retenido</Label>
                <div className="flex h-10 w-full items-center rounded-lg border border-input bg-muted px-3 text-sm font-medium">
                  ${valorRetenido.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea id="observaciones" name="observaciones" />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando..." : "Crear Retención"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
