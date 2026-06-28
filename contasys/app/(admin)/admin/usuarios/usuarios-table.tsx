"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Ban, CheckCircle, Trash2, Send, Shield, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { suspenderUsuario, reactivarUsuario, eliminarUsuario, restablecerPassword } from "@/actions/admin";

type UsuarioItem = { id: string; nombre: string; email: string; rolPlataforma: string; creadoEn: Date };

export function UsuariosTable({ usuarios, search }: { usuarios: UsuarioItem[]; search?: string }) {
  const router = useRouter();
  const [, formActionSuspender] = useActionState(suspenderUsuario, null);
  const [, formActionReactivar] = useActionState(reactivarUsuario, null);
  const [, formActionEliminar] = useActionState(eliminarUsuario, null);
  const [, formActionRestablecer] = useActionState(restablecerPassword, null);
  const [searchValue, setSearchValue] = useState(search || "");

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => { e.preventDefault(); router.push(`/admin/usuarios${searchValue ? `?search=${encodeURIComponent(searchValue)}` : ""}`); }}
        className="flex gap-2 max-w-sm"
      >
        <Input placeholder="Buscar por nombre o email..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
        <Button type="submit" variant="outline" size="sm"><Search className="h-4 w-4" /></Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">Ningún usuario encontrado</TableCell>
            </TableRow>
          ) : (
            usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nombre}</TableCell>
                <TableCell className="text-sm">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.rolPlataforma === "superadmin" ? "default" : "secondary"} className="text-xs">
                    {u.rolPlataforma === "superadmin" ? <Shield className="h-3 w-3 inline mr-1" /> : <UserIcon className="h-3 w-3 inline mr-1" />}
                    {u.rolPlataforma}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(u.creadoEn).toLocaleDateString("es-EC")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <form action={formActionSuspender}>
                      <input type="hidden" name="id" value={u.id} />
                      <Button variant="ghost" size="icon-xs" title="Suspender"><Ban className="h-4 w-4 text-amber-600" /></Button>
                    </form>
                    <form action={formActionReactivar}>
                      <input type="hidden" name="id" value={u.id} />
                      <Button variant="ghost" size="icon-xs" title="Reactivar"><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                    </form>
                    <form action={formActionRestablecer}>
                      <input type="hidden" name="email" value={u.email} />
                      <Button variant="ghost" size="icon-xs" title="Restablecer contraseña"><Send className="h-4 w-4 text-blue-600" /></Button>
                    </form>
                    <form action={formActionEliminar}>
                      <input type="hidden" name="id" value={u.id} />
                      <Button variant="ghost" size="icon-xs" title="Eliminar"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
