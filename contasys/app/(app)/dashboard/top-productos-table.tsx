"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TopProductosTable({
  productos,
}: {
  productos: { nombre: string; cantidad: number; total: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Productos Más Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        {productos.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No hay productos vendidos aún. Crea tu primera factura para ver datos aquí.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((p, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell className="text-right">{p.cantidad}</TableCell>
                  <TableCell className="text-right">
                    ${p.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
