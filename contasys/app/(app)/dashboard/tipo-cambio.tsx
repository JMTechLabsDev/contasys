"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Rates = { moneda: string; codigo: string; tasa: number; bandera: string }[];

export function TipoCambioWidget({ rates, ultimaActualizacion }: { rates: Rates; ultimaActualizacion: string }) {
  const router = useRouter();
  const [actualizando, setActualizando] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Tipo de Cambio Referencial</span>
          <button
            onClick={() => { setActualizando(true); router.refresh(); }}
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${actualizando ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rates.map((r) => (
          <div key={r.codigo} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">{r.bandera}</span>
              <div>
                <p className="font-medium">{r.moneda}</p>
                <p className="text-xs text-muted-foreground">{r.codigo}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{r.tasa.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">1 USD</p>
            </div>
          </div>
        ))}
        <p className="text-center text-[10px] text-muted-foreground">
          Fuente: Frankfurter.app · Actualizado: {ultimaActualizacion}
        </p>
      </CardContent>
    </Card>
  );
}
