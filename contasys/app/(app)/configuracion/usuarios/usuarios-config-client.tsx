"use client";

import { useActionState, useState } from "react";
import { invitarUsuario, actualizarRolUsuario, eliminarUsuarioEmpresa } from "@/actions/empresa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roleLabels: Record<string, string> = {
  propietario: "Propietario",
  administrador: "Administrador",
  gerente: "Gerente",
  contador: "Contador",
  facturacion: "Facturación",
  vendedor: "Vendedor",
};

const roleOptions = ["administrador", "gerente", "contador", "facturacion", "vendedor"];

export function UsuariosConfigClient({
  miembros,
  empresaNombre,
  usuarioActualId,
}: {
  miembros: { id: string; usuarioId: string; rol: string; activo: boolean; invitadoEn: Date; aceptadoEn: Date | null; usuario: { id: string; nombre: string; email: string; avatarUrl: string | null } }[];
  empresaNombre: string;
  usuarioActualId: string;
}) {
  const [inviteState, formActionInvite, invPending] = useActionState(invitarUsuario, null);
  const [rolState, formActionRol, rolPending] = useActionState(actualizarRolUsuario, null);
  const [elimState, formActionElim, elimPending] = useActionState(eliminarUsuarioEmpresa, null);

  const [rolModal, setRolModal] = useState<{ usuarioId: string; nombre: string; rolActual: string } | null>(null);
  const [nuevoRol, setNuevoRol] = useState("");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">Gestiona los colaboradores de {empresaNombre}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Invitar Colaborador</CardTitle></CardHeader>
        <CardContent>
          <form action={formActionInvite} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="invite-email">Correo Electrónico</Label>
              <Input id="invite-email" name="email" type="email" placeholder="colaborador@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-rol">Rol</Label>
              <Select name="rol" defaultValue="facturacion" required>
                <SelectTrigger id="invite-rol" className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={invPending}>Invitar</Button>
          </form>
          {inviteState?.error && <p className="mt-2 text-sm text-destructive">{inviteState.error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Colaboradores ({miembros.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {miembros.map((m) => (
              <div key={m.id} className={`flex items-center justify-between p-4 border rounded-lg ${!m.activo ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {m.usuario.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{m.usuario.nombre}</p>
                    <p className="text-sm text-muted-foreground">{m.usuario.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{roleLabels[m.rol] ?? m.rol}</Badge>
                  {m.rol !== "propietario" && (
                    <>
                      <Dialog>
                        <DialogTrigger>
                          <Button variant="outline" size="sm" onClick={() => { setRolModal({ usuarioId: m.usuarioId, nombre: m.usuario.nombre, rolActual: m.rol }); setNuevoRol(m.rol); }}>Cambiar Rol</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Cambiar rol de {m.usuario.nombre}</DialogTitle></DialogHeader>
                          <form action={formActionRol} className="space-y-4">
                            <input type="hidden" name="usuarioId" value={m.usuarioId} />
                            <div className="space-y-2">
                              <Label>Nuevo Rol</Label>
                              <Select name="rol" defaultValue={m.rol} onValueChange={(v) => setNuevoRol(v ?? m.rol)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {roleOptions.map((r) => <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button type="submit" disabled={rolPending}>Guardar</Button>
                            {rolState?.error && <p className="text-sm text-destructive">{rolState.error}</p>}
                          </form>
                        </DialogContent>
                      </Dialog>
                      <form action={formActionElim}>
                        <input type="hidden" name="usuarioId" value={m.usuarioId} />
                        <Button variant="destructive" size="sm" disabled={elimPending} onClick={(e) => { if (!confirm(`¿Eliminar a ${m.usuario.nombre} de la empresa?`)) e.preventDefault(); }}>
                          {m.activo ? "Eliminar" : "Reactivar"}
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          {miembros.length === 0 && <p className="text-muted-foreground text-sm">No hay colaboradores</p>}
        </CardContent>
      </Card>
    </div>
  );
}
