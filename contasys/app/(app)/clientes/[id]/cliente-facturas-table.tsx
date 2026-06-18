"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const estadoColors: Record<string, string> = {
  borrador: "bg-muted text-muted-foreground",
  pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  procesando: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  autorizado: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  rechazado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  anulado: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export function ClienteFacturasTable({
  facturas,
}: {
  facturas: {
    id: string;
    numeroFactura: string;
    tipoComprobante: string;
    estado: string;
    total: import("@prisma/client").Prisma.Decimal;
    fechaEmision: Date;
  }[];
}) {
  const formatMoney = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <div className="rounded-lg border">
      {facturas.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground text-center">
          No hay facturas para este cliente.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead># Factura</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facturas.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-mono text-xs">{f.numeroFactura}</TableCell>
                <TableCell className="capitalize">{f.tipoComprobante.replace("_", " ")}</TableCell>
                <TableCell>{f.fechaEmision.toLocaleDateString("es-EC")}</TableCell>
                <TableCell>
                  <Badge className={estadoColors[f.estado] || ""}>{f.estado}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatMoney(Number(f.total))}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/facturas/${f.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Ver
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
