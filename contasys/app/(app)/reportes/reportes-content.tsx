"use client";

import { useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Printer } from "lucide-react";

type Props = {
  ventasDiarias: { fecha: string; total: number; count: number }[];
  ventasSemanales: { semana: string; total: number; count: number }[];
  ventasMensuales: { mes: string; total: number; count: number }[];
  ventasAnuales: { fecha: string; total: number; count: number }[];
  topClientes: { nombre: string; total: number; count: number }[];
  clientesInactivos: { id: string; nombre: string; identificacion: string; email: string | null; telefono: string | null; creadoEn: Date }[];
  ticketPromedio: number;
  totalVentas: number;
  rentabilidad: { producto: string; vendido: number; ingresos: number; rentabilidad: number }[];
  ivaMensual: { mes: string; base: number; iva: number }[];
  retenciones: any[];
  formatMoney: (n: number) => string;
};

const tooltipStyle = {
  borderRadius: "8px", border: "1px solid hsl(var(--border))",
  background: "hsl(var(--card))", color: "hsl(var(--card-foreground))",
};

function formatDate(d: Date) { return d.toLocaleDateString("es-EC"); }

function descargarCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  a.click(); URL.revokeObjectURL(url);
}

export function ReportesContent(p: Props) {
  const [tab, setTab] = useState("ventas");
  const printRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: "ventas", label: "Ventas" },
    { id: "clientes", label: "Clientes" },
    { id: "productos", label: "Productos" },
    { id: "fiscal", label: "Fiscal" },
  ];

  return (
    <div className="space-y-6" ref={printRef}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Reportes</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" /> Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            if (tab === "ventas") descargarCSV("ventas.csv",
              ["Fecha", "Total", "Facturas"],
              p.ventasDiarias.map(r => [r.fecha, p.formatMoney(r.total), String(r.count)]));
            else if (tab === "clientes") descargarCSV("clientes.csv",
              ["Cliente", "Total", "Facturas"],
              p.topClientes.map(r => [r.nombre, p.formatMoney(r.total), String(r.count)]));
            else if (tab === "productos") descargarCSV("productos.csv",
              ["Producto", "Vendido", "Ingresos", "Rentabilidad"],
              p.rentabilidad.map(r => [r.producto, String(r.vendido), p.formatMoney(r.ingresos), p.formatMoney(r.rentabilidad)]));
            else if (tab === "fiscal") descargarCSV("iva.csv",
              ["Mes", "Base Imponible", "IVA"],
              p.ivaMensual.map(r => [r.mes, p.formatMoney(r.base), p.formatMoney(r.iva)]));
          }}>
            <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "ventas" && <VentasTab p={p} />}
      {tab === "clientes" && <ClientesTab p={p} />}
      {tab === "productos" && <ProductosTab p={p} />}
      {tab === "fiscal" && <FiscalTab p={p} />}
    </div>
  );
}

function VentasTab({ p }: { p: Props }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Ventas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{p.formatMoney(p.totalVentas)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Ticket Promedio</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{p.formatMoney(p.ticketPromedio)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Facturas Año</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{p.ventasAnuales.reduce((s, r) => s + r.count, 0)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Días con Ventas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{p.ventasDiarias.filter(r => r.total > 0).length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Ventas Mensuales</CardTitle></CardHeader>
        <CardContent><div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={p.ventasMensuales}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="mes" className="text-xs" tickLine={false} />
              <YAxis className="text-xs" tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [p.formatMoney(Number(v)), "Ventas"]} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Ventas Semanales</CardTitle></CardHeader>
        <CardContent><div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={p.ventasSemanales}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="semana" className="text-xs" tickLine={false} />
              <YAxis className="text-xs" tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [p.formatMoney(Number(v)), "Ventas"]} />
              <Bar dataKey="total" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div></CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Últimas 90 Ventas Diarias</CardTitle>
          <Button variant="outline" size="sm" onClick={() => descargarCSV("ventas-diarias.csv",
            ["Fecha", "Total", "Facturas"],
            p.ventasDiarias.map(r => [r.fecha, p.formatMoney(r.total), String(r.count)]))}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="max-h-80 overflow-y-auto text-sm">
            <table className="w-full"><thead><tr className="border-b bg-muted/50">
              <th className="text-left p-2">Fecha</th><th className="text-right p-2">Total</th><th className="text-right p-2">Facturas</th>
            </tr></thead><tbody>
              {p.ventasDiarias.map(r => (
                <tr key={r.fecha} className="border-b"><td className="p-2">{r.fecha}</td>
                  <td className="p-2 text-right">{p.formatMoney(r.total)}</td>
                  <td className="p-2 text-right">{r.count}</td></tr>
              ))}
            </tbody></table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClientesTab({ p }: { p: Props }) {
  const seisMesesAtras = new Date(); seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
  const inactivos = p.clientesInactivos.filter(c => c.creadoEn < seisMesesAtras);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Top Clientes</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{p.topClientes.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Clientes</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{p.clientesInactivos.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Posibles Inactivos</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-500">{inactivos.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Top 10 Clientes por Ventas</CardTitle>
          <Button variant="outline" size="sm" onClick={() => descargarCSV("top-clientes.csv",
            ["Cliente", "Total", "Facturas"],
            p.topClientes.map(r => [r.nombre, p.formatMoney(r.total), String(r.count)]))}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm"><thead><tr className="border-b bg-muted/50">
            <th className="text-left p-2">#</th><th className="text-left p-2">Cliente</th>
            <th className="text-right p-2">Total</th><th className="text-right p-2">Facturas</th>
          </tr></thead><tbody>
            {p.topClientes.map((c, i) => (
              <tr key={c.nombre} className="border-b">
                <td className="p-2 text-muted-foreground">{i + 1}</td>
                <td className="p-2 font-medium">{c.nombre}</td>
                <td className="p-2 text-right">{p.formatMoney(c.total)}</td>
                <td className="p-2 text-right">{c.count}</td>
              </tr>
            ))}
          </tbody></table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Clientes Inactivos (&gt;6 meses sin actividad)</CardTitle></CardHeader>
        <CardContent>
          {inactivos.length === 0 ? (
            <p className="text-muted-foreground">No hay clientes inactivos</p>
          ) : (
            <div className="max-h-60 overflow-y-auto text-sm">
              <table className="w-full"><thead><tr className="border-b bg-muted/50">
                <th className="text-left p-2">Nombre</th><th className="text-left p-2">ID</th>
                <th className="text-left p-2">Email</th><th className="text-left p-2">Creado</th>
              </tr></thead><tbody>
                {inactivos.map(c => (
                  <tr key={c.id} className="border-b"><td className="p-2">{c.nombre}</td>
                    <td className="p-2">{c.identificacion}</td>
                    <td className="p-2">{c.email || "—"}</td>
                    <td className="p-2">{formatDate(c.creadoEn)}</td></tr>
                ))}
              </tbody></table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProductosTab({ p }: { p: Props }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Productos Vendidos</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{p.rentabilidad.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Ingresos</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{p.formatMoney(p.rentabilidad.reduce((s, r) => s + r.ingresos, 0))}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Rentabilidad Total</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{p.formatMoney(p.rentabilidad.reduce((s, r) => s + r.rentabilidad, 0))}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Rentabilidad por Producto</CardTitle>
          <Button variant="outline" size="sm" onClick={() => descargarCSV("rentabilidad.csv",
            ["Producto", "Vendido", "Ingresos", "Rentabilidad"],
            p.rentabilidad.map(r => [r.producto, String(r.vendido), p.formatMoney(r.ingresos), p.formatMoney(r.rentabilidad)]))}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto text-sm">
            <table className="w-full"><thead><tr className="border-b bg-muted/50">
              <th className="text-left p-2">Producto</th><th className="text-right p-2">Vendido</th>
              <th className="text-right p-2">Ingresos</th><th className="text-right p-2">Rentabilidad</th><th className="text-right p-2">Margen</th>
            </tr></thead><tbody>
              {p.rentabilidad.map(r => {
                const margen = r.ingresos > 0 ? (r.rentabilidad / r.ingresos * 100) : 0;
                return (
                  <tr key={r.producto} className="border-b"><td className="p-2">{r.producto}</td>
                    <td className="p-2 text-right">{r.vendido}</td>
                    <td className="p-2 text-right">{p.formatMoney(r.ingresos)}</td>
                    <td className={`p-2 text-right ${r.rentabilidad >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {p.formatMoney(r.rentabilidad)}</td>
                    <td className="p-2 text-right">{margen.toFixed(1)}%</td></tr>
                );
              })}
            </tbody></table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FiscalTab({ p }: { p: Props }) {
  const totalIva = p.ivaMensual.reduce((s, r) => s + r.iva, 0);
  const totalBase = p.ivaMensual.reduce((s, r) => s + r.base, 0);
  const totalRetenido = p.retenciones.reduce((s: number, r: any) => s + Number(r.valorRetenido || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Base Imponible</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{p.formatMoney(totalBase)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">IVA Generado</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{p.formatMoney(totalIva)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Retenciones</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{p.formatMoney(totalRetenido)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">IVA Mensual</CardTitle>
          <Button variant="outline" size="sm" onClick={() => descargarCSV("iva.csv",
            ["Mes", "Base Imponible", "IVA"],
            p.ivaMensual.map(r => [r.mes, p.formatMoney(r.base), p.formatMoney(r.iva)]))}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </CardHeader>
        <CardContent><div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={p.ivaMensual}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="mes" className="text-xs" tickLine={false} />
              <YAxis className="text-xs" tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="base" fill="hsl(var(--primary))" name="Base" radius={[4, 4, 0, 0]} />
              <Bar dataKey="iva" fill="hsl(var(--chart-2))" name="IVA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div></CardContent>
      </Card>

      {p.retenciones.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Retenciones Emitidas</CardTitle>
            <Button variant="outline" size="sm" onClick={() => descargarCSV("retenciones.csv",
              ["Número", "Cliente", "ID", "Fecha", "Base Ret", "Impuesto", "Valor Retenido"],
              p.retenciones.map((r: any) => [r.numeroFactura, r.cliente?.nombre || "", r.cliente?.identificacion || "",
                formatDate(r.fechaEmision), p.formatMoney(Number(r.baseImponibleRet || 0)),
                r.impuestoRetenido || "", p.formatMoney(Number(r.valorRetenido || 0))]))}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto text-sm">
              <table className="w-full"><thead><tr className="border-b bg-muted/50">
                <th className="text-left p-2">#</th><th className="text-left p-2">Cliente</th>
                <th className="text-left p-2">Fecha</th><th className="text-left p-2">Impuesto</th>
                <th className="text-right p-2">Base</th><th className="text-right p-2">Valor</th>
              </tr></thead><tbody>
                {p.retenciones.map((r: any) => (
                  <tr key={r.id} className="border-b"><td className="p-2">{r.numeroFactura}</td>
                    <td className="p-2">{r.cliente?.nombre || "—"}</td>
                    <td className="p-2">{formatDate(r.fechaEmision)}</td>
                    <td className="p-2">{r.impuestoRetenido || "—"}</td>
                    <td className="p-2 text-right">{p.formatMoney(Number(r.baseImponibleRet || 0))}</td>
                    <td className="p-2 text-right">{p.formatMoney(Number(r.valorRetenido || 0))}</td></tr>
                ))}
              </tbody></table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
