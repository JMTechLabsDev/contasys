"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

const estadoColor: Record<string, string> = {
  borrador: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  pendiente: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  procesando: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  autorizado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  rechazado: "bg-destructive/10 text-destructive",
  anulado: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const estadoLabel: Record<string, string> = {
  borrador: "Borrador",
  pendiente: "Pendiente",
  procesando: "Procesando",
  autorizado: "Autorizado",
  rechazado: "Rechazado",
  anulado: "Anulado",
};

export function GuiasTable({
  guias,
  page,
  totalPages,
}: {
  guias: Array<{
    id: string;
    numeroFactura: string;
    estado: string;
    fechaEmision: Date;
    cliente: { nombre: string };
    transportistaNombre?: string | null;
    puntoDestino?: string | null;
    placa?: string | null;
  }>;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();

  const goToPage = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    router.push(`/facturas/guias?${params.toString()}`);
  };

  return (
    <div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead># Guía</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Transportista</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay guías de remisión registradas.
                </TableCell>
              </TableRow>
            ) : (
              guias.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-mono text-xs font-medium">{g.numeroFactura}</TableCell>
                  <TableCell className="font-medium">{g.cliente.nombre}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(g.fechaEmision).toLocaleDateString("es-EC")}
                  </TableCell>
                  <TableCell className="text-xs">{g.transportistaNombre || "—"}</TableCell>
                  <TableCell className="text-xs">{g.puntoDestino || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{g.placa || "—"}</TableCell>
                  <TableCell>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${estadoColor[g.estado] || ""}`}>
                      {estadoLabel[g.estado] || g.estado}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/facturas/${g.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
