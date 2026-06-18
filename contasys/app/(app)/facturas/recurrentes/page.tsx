import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { Plus, Eye } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const frecuenciaLabel: Record<string, string> = {
  semanal: "Semanal",
  mensual: "Mensual",
  anual: "Anual",
};

export default async function RecurrentesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get("empresa_activa")?.value;

  const eu = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true, ...(empresaActivaId ? { empresaId: empresaActivaId } : {}) },
  });
  if (!eu) redirect("/onboarding");

  const recurrencias = await prisma.recurrencia.findMany({
    where: { empresaId: eu.empresaId },
    include: { cliente: { select: { nombre: true } }, items: true },
    orderBy: { creadoEn: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facturación Recurrente</h1>
          <p className="text-muted-foreground">{recurrencias.length} recurrencia{recurrencias.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/facturas/recurrentes/nueva"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Recurrencia
        </Link>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Frecuencia</TableHead>
              <TableHead>Día Ejecución</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recurrencias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hay recurrencias registradas. Crea tu primera recurrencia.
                </TableCell>
              </TableRow>
            ) : (
              recurrencias.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.cliente.nombre}</TableCell>
                  <TableCell className="capitalize">{frecuenciaLabel[r.frecuencia] || r.frecuencia}</TableCell>
                  <TableCell>{r.diaEjecucion}</TableCell>
                  <TableCell>{r.items.length} item{r.items.length !== 1 ? "s" : ""}</TableCell>
                  <TableCell>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${r.activa ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                      {r.activa ? "Activa" : "Inactiva"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/facturas/recurrentes/${r.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
