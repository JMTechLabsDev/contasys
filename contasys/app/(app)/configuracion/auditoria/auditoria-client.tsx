"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const accionLabels: Record<string, string> = {
  actualizar_empresa: "Actualizar Empresa",
  actualizar_configuracion: "Actualizar Configuración",
  invitar_usuario: "Invitar Usuario",
  cambiar_rol_usuario: "Cambiar Rol",
  eliminar_usuario_empresa: "Eliminar Usuario",
};

export function AuditoriaClient({ registros }: {
  registros: { id: string; accion: string; recurso: string; recursoId: string | null; datosAnteriores: unknown; datosNuevos: unknown; ip: string | null; userAgent: string | null; creadoEn: Date; usuario: { nombre: string; email: string } }[];
}) {
  const [search, setSearch] = useState("");

  const filtered = registros.filter((r) =>
    r.usuario.nombre.toLowerCase().includes(search.toLowerCase()) ||
    r.accion.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Auditoría</h1>
        <p className="text-muted-foreground">Registro de actividades de la empresa</p>
      </div>

      <Input placeholder="Buscar por usuario o acción..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      <Card>
        <CardHeader><CardTitle>Actividad Reciente</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.map((r) => (
              <div key={r.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                  {r.usuario.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{r.usuario.nombre}</p>
                    <Badge variant="outline" className="text-xs">{accionLabels[r.accion] ?? r.accion}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(r.creadoEn).toLocaleString("es-EC")}</span>
                  </div>
                  {!!r.datosNuevos && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      Datos: {JSON.stringify(r.datosNuevos as Record<string, unknown>)}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground">No se encontraron registros</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
