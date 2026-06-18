import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FacturaActions } from "./factura-actions";
import { FacturaPreview } from "@/components/facturas/factura-preview";
import { SriPanel } from "@/components/facturas/sri-panel";

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

export default async function FacturaDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const factura = await prisma.factura.findFirst({
    where: { id, empresaId: eu.empresaId },
    include: {
      cliente: { select: { nombre: true, identificacion: true, direccion: true, telefono: true, email: true } },
      facturaItems: { orderBy: { id: "asc" } },
    },
  });

  if (!factura) notFound();

  const empresa = await prisma.empresa.findUnique({
    where: { id: eu.empresaId },
    select: { nombre: true, ruc: true, direccion: true, telefono: true, email: true, ciudad: true },
  });
  if (!empresa) notFound();

  const formatMoney = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (d: Date) => new Date(d).toLocaleDateString("es-EC", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const estadosSiguientes: Record<string, string[]> = {
    borrador: ["pendiente"],
    pendiente: ["procesando", "anulado"],
    procesando: ["autorizado", "rechazado"],
    autorizado: [],
    rechazado: [],
    anulado: [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/facturas" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Volver a facturas
          </Link>
          <h1 className="text-3xl font-bold mt-1">Factura {factura.numeroFactura}</h1>
        </div>
        <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${estadoColor[factura.estado] || ""}`}>
          {estadoLabel[factura.estado] || factura.estado}
        </span>
      </div>

      <div className="rounded-lg border p-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Cliente</h3>
            <p className="font-medium">{factura.cliente.nombre}</p>
            <p className="text-sm text-muted-foreground">ID: {factura.cliente.identificacion}</p>
            {factura.cliente.direccion && <p className="text-sm text-muted-foreground">{factura.cliente.direccion}</p>}
            {factura.cliente.telefono && <p className="text-sm text-muted-foreground">{factura.cliente.telefono}</p>}
            {factura.cliente.email && <p className="text-sm text-muted-foreground">{factura.cliente.email}</p>}
          </div>
          <div className="text-right">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Detalles</h3>
            <p className="text-sm">Fecha de emisión: {formatDate(factura.fechaEmision)}</p>
            <p className="text-sm capitalize">Tipo: {factura.tipoComprobante.replace("_", " ")}</p>
            {factura.metodoPago && <p className="text-sm">Pago: {factura.metodoPago}</p>}
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">Descripción</th>
              <th className="text-right px-4 py-3 font-medium">Cant.</th>
              <th className="text-right px-4 py-3 font-medium">P. Unit.</th>
              <th className="text-right px-4 py-3 font-medium">Desc.</th>
              <th className="text-right px-4 py-3 font-medium">Subtotal</th>
              <th className="text-right px-4 py-3 font-medium">IVA</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {factura.facturaItems.map((item, idx) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                <td className="px-4 py-3">{item.descripcion}</td>
                <td className="px-4 py-3 text-right">{Number(item.cantidad)}</td>
                <td className="px-4 py-3 text-right">{formatMoney(Number(item.precioUnitario))}</td>
                <td className="px-4 py-3 text-right">{Number(item.descuento) > 0 ? formatMoney(Number(item.descuento)) : "—"}</td>
                <td className="px-4 py-3 text-right">{formatMoney(Number(item.subtotal))}</td>
                <td className="px-4 py-3 text-right">{formatMoney(Number(item.iva))}</td>
                <td className="px-4 py-3 text-right font-medium">{formatMoney(Number(item.total))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border p-4 ml-auto w-72 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatMoney(Number(factura.subtotal))}</span>
        </div>
        {Number(factura.descuento) > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Descuento</span>
            <span className="text-destructive">-{formatMoney(Number(factura.descuento))}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">IVA</span>
          <span>{formatMoney(Number(factura.iva))}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-1 border-t">
          <span>Total</span>
          <span>{formatMoney(Number(factura.total))}</span>
        </div>
      </div>

      <FacturaPreview
        factura={{
          numeroFactura: factura.numeroFactura,
          fechaEmision: factura.fechaEmision,
          tipoComprobante: factura.tipoComprobante,
          estado: factura.estado,
          subtotal: Number(factura.subtotal),
          descuento: Number(factura.descuento),
          iva: Number(factura.iva),
          total: Number(factura.total),
          observaciones: factura.observaciones,
          metodoPago: factura.metodoPago,
          cliente: factura.cliente,
          facturaItems: factura.facturaItems.map((i) => ({
            descripcion: i.descripcion,
            cantidad: Number(i.cantidad),
            precioUnitario: Number(i.precioUnitario),
            descuento: Number(i.descuento),
            subtotal: Number(i.subtotal),
            iva: Number(i.iva),
            total: Number(i.total),
          })),
        }}
        empresa={empresa}
      />

      <SriPanel
        facturaId={factura.id}
        estado={factura.estado}
        sriRespuesta={factura.sriRespuesta as Record<string, unknown> | null}
      />

      <FacturaActions
        facturaId={factura.id}
        estadoActual={factura.estado}
        estadosSiguientes={estadosSiguientes[factura.estado] || []}
        isAnulado={factura.estado === "anulado"}
        esNotaCredito={factura.tipoComprobante === "nota_credito"}
        esFactura={factura.tipoComprobante === "factura"}
      />
    </div>
  );
}
