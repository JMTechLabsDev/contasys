import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";
import { ProductoForm } from "../producto-form";
import { eliminarProducto } from "@/actions/producto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, BarChart3, ShoppingCart, TrendingUp, Trash2 } from "lucide-react";

export default async function ProductoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get("empresa_activa")?.value;

  const eu = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true, ...(empresaActivaId ? { empresaId: empresaActivaId } : {}) },
  });
  if (!eu) redirect("/onboarding");

  const { id } = await params;

  const producto = await prisma.producto.findFirst({ where: { id, empresaId: eu.empresaId } });
  if (!producto) notFound();

  const [totalVendido, vecesFacturado] = await Promise.all([
    prisma.facturaItem.aggregate({
      where: { productoId: id, factura: { empresaId: eu.empresaId, estado: "autorizado" } },
      _sum: { subtotal: true, cantidad: true },
    }),
    prisma.facturaItem.count({
      where: { productoId: id, factura: { empresaId: eu.empresaId, estado: "autorizado" } },
    }),
  ]);

  const cantidadVendida = Number(totalVendido._sum.cantidad || 0);
  const ingresos = Number(totalVendido._sum.subtotal || 0);
  const costoUnitario = producto.costo ? Number(producto.costo) : null;
  const rentabilidad = costoUnitario
    ? ((Number(producto.precio) - costoUnitario) / Number(producto.precio)) * 100
    : null;

  const formatMoney = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{producto.nombre}</h1>
          <p className="text-muted-foreground">{producto.sku ? `SKU: ${producto.sku}` : "Sin SKU"}</p>
          {producto.categoria && (
            <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary mt-1">
              {producto.categoria}
            </span>
          )}
        </div>
        <form action={eliminarProducto}>
          <input type="hidden" name="id" value={producto.id} />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 text-destructive px-3 py-1.5 text-sm font-medium hover:bg-destructive/10 transition-colors"
            onClick={(e) => { if (!confirm("¿Eliminar este producto? Se desactivará pero los datos históricos se conservarán.")) e.preventDefault(); }}
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio de Venta</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(Number(producto.precio))}</div>
            {producto.impuesto && <p className="text-xs text-muted-foreground">Impuesto: {producto.impuesto}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{costoUnitario ? formatMoney(costoUnitario) : "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rentabilidad</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${rentabilidad !== null && rentabilidad >= 0 ? "text-emerald-600" : "text-destructive"}`}>
              {rentabilidad !== null ? `${rentabilidad.toFixed(1)}%` : "—"}
            </div>
            {rentabilidad !== null && (
              <p className="text-xs text-muted-foreground">
                Margen sobre precio de venta
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {producto.stock !== null ? producto.stock : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {producto.stock === 0 ? "Agotado" : producto.stock !== null && producto.stock <= 5 ? "Stock bajo" : producto.stock !== null ? "Stock normal" : "Sin control"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Unidades Vendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cantidadVendida}</div>
            <p className="text-xs text-muted-foreground">En {vecesFacturado} factura{vecesFacturado !== 1 ? "s" : ""}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ingresos Generados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatMoney(ingresos)}</div>
          </CardContent>
        </Card>
      </div>

      {producto.descripcion && (
        <div className="rounded-lg border p-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-1">Descripción</h2>
          <p className="text-sm">{producto.descripcion}</p>
        </div>
      )}

      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Editar Producto</h2>
        <ProductoForm
          isEditing
          defaultValues={{
            id: producto.id,
            nombre: producto.nombre,
            sku: producto.sku,
            descripcion: producto.descripcion,
            categoria: producto.categoria,
            precio: Number(producto.precio),
            costo: producto.costo ? Number(producto.costo) : null,
            impuesto: producto.impuesto,
            stock: producto.stock,
          }}
        />
      </div>
    </div>
  );
}
