"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { Producto } from "@prisma/client";

const stockLevel = (s: number | null) => {
  if (s === null) return null;
  if (s === 0) return { label: "Agotado", class: "bg-destructive/10 text-destructive" };
  if (s <= 5) return { label: "Stock Bajo", class: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" };
  return { label: "Normal", class: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" };
};

export function ProductosTable({
  productos,
  query,
  categoria,
  page,
  totalPages,
}: {
  productos: Producto[];
  query: string;
  categoria: string;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();

  const goToPage = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (categoria) params.set("categoria", categoria);
    params.set("page", String(p));
    router.push(`/productos?${params.toString()}`);
  };

  const formatMoney = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Costo</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Impuesto</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {query || categoria
                    ? "No se encontraron productos con esos filtros"
                    : "No hay productos registrados. Crea tu primer producto."}
                </TableCell>
              </TableRow>
            ) : (
              productos.map((p) => {
                const stock = stockLevel(p.stock);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.sku || "—"}</TableCell>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{p.categoria || "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatMoney(Number(p.precio))}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {p.costo ? formatMoney(Number(p.costo)) : "—"}
                    </TableCell>
                    <TableCell>
                      {stock ? (
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${stock.class}`}>
                          {stock.label}
                          {p.stock !== null ? ` (${p.stock})` : ""}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{p.impuesto}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/productos/${p.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                        <Eye className="h-3.5 w-3.5" />
                        Ver
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
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
