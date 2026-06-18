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

interface RetencionRow {
  id: string;
  numeroFactura: string;
  estado: string;
  total: { toString: () => string };
  fechaEmision: Date;
  cliente: { nombre: string };
  ejercicioFiscal: number | null;
  impuestoRetenido: string | null;
  porcentajeRetener: { toString: () => string } | null;
  baseImponibleRet: { toString: () => string } | null;
}

export function RetencionesTable({
  retenciones,
  page,
  totalPages,
}: {
  retenciones: RetencionRow[];
  page: number;
  totalPages: number;
}) {
  const router = useRouter();

  const goToPage = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    router.push(`/facturas/retenciones?${params.toString()}`);
  };

  const formatMoney = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead># Retención</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Ejercicio Fiscal</TableHead>
              <TableHead>Impuesto</TableHead>
              <TableHead>% Retenido</TableHead>
              <TableHead className="text-right">Base</TableHead>
              <TableHead className="text-right">Valor Retenido</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {retenciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No hay retenciones registradas.
                </TableCell>
              </TableRow>
            ) : (
              retenciones.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs font-medium">{r.numeroFactura}</TableCell>
                  <TableCell className="font-medium">{r.cliente.nombre}</TableCell>
                  <TableCell className="text-xs">{r.ejercicioFiscal ?? "-"}</TableCell>
                  <TableCell className="text-xs">{r.impuestoRetenido ?? "-"}</TableCell>
                  <TableCell className="text-xs">{r.porcentajeRetener ? `${Number(r.porcentajeRetener)}%` : "-"}</TableCell>
                  <TableCell className="text-right text-xs">{r.baseImponibleRet ? formatMoney(Number(r.baseImponibleRet)) : "-"}</TableCell>
                  <TableCell className="text-right font-medium">{formatMoney(Number(r.total))}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(r.fechaEmision).toLocaleDateString("es-EC")}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${estadoColor[r.estado] || ""}`}>
                      {estadoLabel[r.estado] || r.estado}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/facturas/${r.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
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
