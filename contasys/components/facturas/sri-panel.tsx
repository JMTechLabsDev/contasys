"use client";

import { enviarFacturaSRI } from "@/actions/sri";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Send, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";

export function SriPanel({
  facturaId,
  estado,
  sriRespuesta,
}: {
  facturaId: string;
  estado: string;
  sriRespuesta: Record<string, unknown> | null;
}) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: "error" | "success" | "rejected"; message: string } | null>(null);

  if (estado === "autorizado") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-emerald-800 dark:text-emerald-300">Factura Autorizada por SRI</h3>
            {sriRespuesta?.numeroAutorizacion ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                No. Autorización: {String(sriRespuesta.numeroAutorizacion)}
              </p>
            ) : null}
            {sriRespuesta?.fechaAutorizacion ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Fecha: {new Date(String(sriRespuesta.fechaAutorizacion)).toLocaleString("es-EC")}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (estado === "rechazado" && sriRespuesta) {
    const errores = Array.isArray(sriRespuesta?.errores) ? (sriRespuesta.errores as Array<{ codigo: string; mensaje: string }>) : [];
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800 dark:text-red-300">Factura Rechazada por SRI</h3>
            {errores.map((e, i) => (
              <p key={i} className="text-sm text-red-600 dark:text-red-400 mt-1">
                {e.mensaje}
              </p>
            ))}
            <form action={async (fd) => { await enviarFacturaSRI(fd); router.refresh(); }}>
              <input type="hidden" name="id" value={facturaId} />
              <Button type="submit" variant="outline" size="sm" className="mt-2">
                <Send className="h-3 w-3" />
                Reintentar envío
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (estado === "procesando") {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-4">
        <div className="flex items-start gap-3">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-300">Procesando con el SRI</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              La factura está siendo procesada. Esto puede tomar unos segundos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleEnviar = async () => {
    setSending(true);
    setResult(null);
    const fd = new FormData();
    fd.set("id", facturaId);
    const res = await enviarFacturaSRI(fd);
    if ("error" in res) {
      setResult({ type: "error", message: res.error as string });
    } else if (res.estado === "RECHAZADO") {
      setResult({ type: "rejected", message: "Factura rechazada por el SRI" });
    } else {
      setResult({ type: "success", message: "Factura autorizada exitosamente" });
    }
    setSending(false);
    router.refresh();
  };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">SRI — Envío a Autorización</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        La factura será generada en formato XML y enviada al SRI para su autorización.
      </p>
      {result && (
        <div className={`text-sm p-2 rounded ${
          result.type === "success" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300" :
          result.type === "error" ? "bg-destructive/10 text-destructive" :
          "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300"
        }`}>
          {result.message}
        </div>
      )}
      <Button onClick={handleEnviar} disabled={sending}>
        {sending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
        ) : (
          <><Send className="h-4 w-4" /> Enviar al SRI</>
        )}
      </Button>
    </div>
  );
}
