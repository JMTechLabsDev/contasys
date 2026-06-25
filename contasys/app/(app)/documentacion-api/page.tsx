"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PathItem = {
  path: string;
  method: string;
  summary: string;
  tags: string[];
};

export default function DocumentacionApiPage() {
  const [paths, setPaths] = useState<PathItem[]>([]);

  useEffect(() => {
    fetch("/api/v1/openapi.json")
      .then((r) => r.json())
      .then((spec) => {
        const items: PathItem[] = [];
        const pathsObj = spec.paths as Record<string, Record<string, { summary?: string; tags?: string[] }>>;
        for (const [path, methods] of Object.entries(pathsObj)) {
          for (const [method, details] of Object.entries(methods)) {
            items.push({ path, method: method.toUpperCase(), summary: details.summary || "", tags: details.tags || [] });
          }
        }
        setPaths(items);
      });
  }, []);

  const methodColors: Record<string, string> = { GET: "bg-green-600", POST: "bg-blue-600", PATCH: "bg-amber-600", DELETE: "bg-red-600" };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Documentación API</h1>
        <p className="text-muted-foreground">API REST v1 — Autenticación via Bearer Token (API Key)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Autenticación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Todas las solicitudes requieren el header:</p>
          <code className="block rounded bg-muted p-2 text-xs">Authorization: Bearer &lt;tu_api_key&gt;</code>
          <p>Genera tu API Key en <a href="/configuracion/api-keys" className="text-primary underline">Configuración → API Keys</a></p>
          <p>URL Base: <code className="rounded bg-muted px-1 text-xs">/api/v1</code></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {paths.map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded border p-3 text-sm">
                <Badge className={`${methodColors[item.method] || "bg-gray-600"} text-white font-mono w-16 justify-center`}>
                  {item.method}
                </Badge>
                <code className="font-mono text-xs flex-1">{item.path}</code>
                <span className="text-muted-foreground flex-1">{item.summary}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Respuestas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Éxito (lista):</strong></p>
          <pre className="rounded bg-muted p-2 text-xs">{JSON.stringify({ data: ["..."], pagination: { page: 1, limit: 20, total: 100, totalPages: 5 } }, null, 2)}</pre>
          <p><strong>Error:</strong></p>
          <pre className="rounded bg-muted p-2 text-xs">{JSON.stringify({ error: "Mensaje", code: "ERROR_CODE" }, null, 2)}</pre>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div><Badge variant="outline">200</Badge> OK</div>
            <div><Badge variant="outline">201</Badge> Creado</div>
            <div><Badge variant="outline">204</Badge> Sin contenido</div>
            <div><Badge variant="outline">400</Badge> Error de validación</div>
            <div><Badge variant="outline">401</Badge> No autorizado</div>
            <div><Badge variant="outline">404</Badge> No encontrado</div>
            <div><Badge variant="outline">429</Badge> Rate limit excedido</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
