import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";
import { ClienteForm } from "../cliente-form";
import { ClienteFacturasTable } from "./cliente-facturas-table";
import { eliminarCliente } from "@/actions/cliente";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, ShoppingCart, Calendar, Trash2 } from "lucide-react";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const cliente = await prisma.cliente.findFirst({
    where: { id, empresaId: eu.empresaId },
  });
  if (!cliente) notFound();

  const [facturas, pagos, ultimaFactura] = await Promise.all([
    prisma.factura.findMany({
      where: { clienteId: id, empresaId: eu.empresaId },
      orderBy: { fechaEmision: "desc" },
      take: 10,
    }),
    prisma.pago.findMany({
      where: { factura: { clienteId: id, empresaId: eu.empresaId } },
      orderBy: { fechaPago: "desc" },
      take: 10,
    }),
    prisma.factura.findFirst({
      where: { clienteId: id, empresaId: eu.empresaId },
      orderBy: { fechaEmision: "desc" },
      select: { fechaEmision: true, total: true },
    }),
  ]);

  const totalFacturado = facturas
    .filter((f) => f.estado === "autorizado")
    .reduce((sum, f) => sum + Number(f.total), 0);

  const totalPagado = pagos.reduce((sum, p) => sum + Number(p.monto), 0);
  const saldoPendiente = totalFacturado - totalPagado;

  const formatMoney = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{cliente.nombre}</h1>
          <p className="text-muted-foreground">{cliente.identificacion}</p>
        </div>
        <form action={eliminarCliente}>
          <input type="hidden" name="id" value={cliente.id} />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 text-destructive px-3 py-1.5 text-sm font-medium hover:bg-destructive/10 transition-colors"
            onClick={(e) => { if (!confirm("¿Eliminar este cliente? Se desactivará pero los datos históricos se conservarán.")) e.preventDefault(); }}
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalFacturado)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalPagado)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoPendiente > 0 ? "text-destructive" : ""}`}>
              {formatMoney(Math.max(0, saldoPendiente))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Compra</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ultimaFactura
                ? ultimaFactura.fechaEmision.toLocaleDateString("es-EC")
                : "—"}
            </div>
            {ultimaFactura && (
              <p className="text-xs text-muted-foreground">
                {formatMoney(Number(ultimaFactura.total))}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Editar Cliente</h2>
        <ClienteForm
          isEditing
          defaultValues={{
            id: cliente.id,
            tipoIdentificacion: cliente.tipoIdentificacion,
            identificacion: cliente.identificacion,
            nombre: cliente.nombre,
            razonSocial: cliente.razonSocial,
            email: cliente.email,
            telefono: cliente.telefono,
            direccion: cliente.direccion,
            ciudad: cliente.ciudad,
            provincia: cliente.provincia,
          }}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Historial de Facturas</h2>
        <ClienteFacturasTable facturas={facturas} />

        {facturas.length === 10 && (
          <p className="text-sm text-muted-foreground text-center">
            Mostrando las últimas 10 facturas
          </p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Historial de Pagos</h2>
        {pagos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay pagos registrados.</p>
        ) : (
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Fecha</th>
                  <th className="text-left p-3 font-medium">Monto</th>
                  <th className="text-left p-3 font-medium">Método</th>
                  <th className="text-left p-3 font-medium">Referencia</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="p-3">{p.fechaPago.toLocaleDateString("es-EC")}</td>
                    <td className="p-3 font-medium">{formatMoney(Number(p.monto))}</td>
                    <td className="p-3 text-muted-foreground">{p.metodo || "—"}</td>
                    <td className="p-3 text-muted-foreground font-mono text-xs">{p.referencia || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
