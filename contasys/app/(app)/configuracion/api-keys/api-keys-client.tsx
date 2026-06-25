"use client";

import { useActionState, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";
import { KeyRound, Copy, Trash2, Check } from "lucide-react";
import { generarApiKey, revocarApiKey } from "@/actions/api-key";

type ApiKeyItem = {
  id: string;
  nombre: string;
  permisos: unknown;
  ultimoUso: Date | null;
  activa: boolean;
  creadoEn: Date;
};

export function ApiKeysClient({ keys }: { keys: ApiKeyItem[] }) {
  const [state, formAction, pending] = useActionState(generarApiKey, null);
  const [, formActionRevocar] = useActionState(revocarApiKey, null);
  const [copied, setCopied] = useState(false);

  const permisosDisponibles = ["clientes", "productos", "facturas", "reportes", "empresas"];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">API Keys</h1>
        <p className="text-muted-foreground">Gestiona las claves de acceso a la API REST pública</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generar nueva API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre de la clave</Label>
              <Input id="nombre" name="nombre" placeholder="Ej: Integración Shopify" required />
            </div>
            <div>
              <Label>Permisos</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {permisosDisponibles.map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="permisos" value={p} defaultChecked={["clientes", "productos", "facturas"].includes(p)} className="h-4 w-4 rounded border-gray-300" />
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={pending}>
              <KeyRound className="h-4 w-4 mr-2" />
              {pending ? "Generando..." : "Generar API Key"}
            </Button>
          </form>

          {state?.apiKey && (
            <div className="mt-4 rounded border border-green-500/30 bg-green-50 dark:bg-green-950/20 p-4">
              <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                API Key generada — cópiala ahora, no podrás verla después
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-background p-2 text-xs break-all select-all">{state.apiKey}</code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { navigator.clipboard.writeText(state.apiKey!); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
          {state?.error && (
            <p className="mt-2 text-sm text-destructive">{state.error}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys activas ({keys.filter((k) => k.activa).length})</CardTitle>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay API Keys creadas</p>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div key={key.id} className="flex items-center justify-between rounded border p-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{key.nombre}</span>
                      <Badge variant={key.activa ? "default" : "secondary"} className="text-xs">
                        {key.activa ? "Activa" : "Revocada"}
                      </Badge>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>Permisos: {(key.permisos as string[])?.join(", ") || "ninguno"}</span>
                      {key.ultimoUso && <span>Último uso: {new Date(key.ultimoUso).toLocaleDateString("es-EC")}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">Creada: {new Date(key.creadoEn).toLocaleDateString("es-EC")}</p>
                  </div>
                  {key.activa && (
                    <form action={formActionRevocar}>
                      <input type="hidden" name="id" value={key.id} />
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
