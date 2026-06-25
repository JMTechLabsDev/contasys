"use client";

import { useState } from "react";
import { useActionState } from "react";
import { crearOrdenPayPal, cancelarSuscripcionPayPal, programarCambioPlan } from "@/actions/suscripcion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const estadoLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  trial: { label: "Prueba", variant: "secondary" },
  activa: { label: "Activa", variant: "default" },
  cancelada: { label: "Cancelada", variant: "outline" },
  vencida: { label: "Vencida", variant: "destructive" },
  pendiente_cambio: { label: "Cambio Pendiente", variant: "secondary" },
};

export function SuscripcionContent({
  suscripcion,
  planes,
  facturasMes,
  usuariosActivos,
  appUrl,
}: {
  suscripcion: {
    id: string; estado: string; periodo: string; fechaInicio: Date; fechaFin: Date | null;
    planPendienteId: string | null; periodoPendiente: string | null;
    plan: { id: string; nombre: string; precioMensual: number; precioAnual: number; limiteFacturas: number | null; limiteUsuarios: number | null; multiempresa: boolean; apiAccess: boolean; reportesAvanzados: boolean; auditoria: boolean };
    planPendiente: { id: string; nombre: string } | null;
    pagos: { id: string; monto: number; moneda: string; estado: string | null; creadoEn: Date; paypalTransactionId: string | null }[];
  } | null;
  planes: { id: string; nombre: string; precioMensual: number; precioAnual: number; limiteFacturas: number | null; limiteUsuarios: number | null; multiempresa: boolean; apiAccess: boolean; reportesAvanzados: boolean; auditoria: boolean }[];
  facturasMes: number;
  usuariosActivos: number;
  appUrl: string;
}) {
  const [orderState, formActionOrder, orderPending] = useActionState(crearOrdenPayPal, null);
  const [cancelState, formActionCancel, cancelPending] = useActionState(cancelarSuscripcionPayPal, null);
  const [changeState, formActionChange, changePending] = useActionState(programarCambioPlan, null);

  const [selectedPlan, setSelectedPlan] = useState(suscripcion?.plan.id ?? planes[0]?.id ?? "");
  const [selectedPeriodo, setSelectedPeriodo] = useState<"mensual" | "anual">("mensual");

  const planActual = suscripcion?.plan;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Suscripción</h1>
        <p className="text-muted-foreground">Administra tu plan y pagos</p>
      </div>

      {suscripcion && (
        <Card>
          <CardHeader><CardTitle>Plan Actual</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">{planActual?.nombre ?? "Sin plan"}</p>
                <p className="text-sm text-muted-foreground">
                  ${Number(planActual?.precioMensual ?? 0).toFixed(2)}/mes · {suscripcion.periodo === "anual" ? "Anual" : "Mensual"}
                </p>
              </div>
              <Badge variant={estadoLabels[suscripcion.estado]?.variant ?? "outline"}>
                {estadoLabels[suscripcion.estado]?.label ?? suscripcion.estado}
              </Badge>
            </div>

            {suscripcion.fechaFin && (
              <p className="text-sm text-muted-foreground">
                {suscripcion.estado === "trial" ? "Período de prueba hasta: " : "Próxima facturación: "}
                {new Date(suscripcion.fechaFin).toLocaleDateString("es-EC")}
              </p>
            )}

            {suscripcion.planPendiente && (
              <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
                Cambio programado a {suscripcion.planPendiente.nombre} ({suscripcion.periodoPendiente === "anual" ? "Anual" : "Mensual"}) al finalizar el período actual.
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-3 border rounded-lg text-center">
                <p className="text-2xl font-bold">{facturasMes}</p>
                <p className="text-xs text-muted-foreground">Facturas / mes</p>
                {planActual && planActual.limiteFacturas !== null && (
                  <p className="text-xs text-muted-foreground">Límite: {planActual.limiteFacturas}</p>
                )}
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-2xl font-bold">{usuariosActivos}</p>
                <p className="text-xs text-muted-foreground">Usuarios</p>
                {planActual && planActual.limiteUsuarios !== null && (
                  <p className="text-xs text-muted-foreground">Límite: {planActual.limiteUsuarios}</p>
                )}
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-2xl font-bold">{planActual?.multiempresa ? "Sí" : "No"}</p>
                <p className="text-xs text-muted-foreground">Multiempresa</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-2xl font-bold">{planActual?.apiAccess ? "Sí" : "No"}</p>
                <p className="text-xs text-muted-foreground">API Access</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Cambiar de Plan</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 border-b">
            <button type="button" onClick={() => setSelectedPeriodo("mensual")} className={`px-4 py-2 text-sm font-medium ${selectedPeriodo === "mensual" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Mensual</button>
            <button type="button" onClick={() => setSelectedPeriodo("anual")} className={`px-4 py-2 text-sm font-medium ${selectedPeriodo === "anual" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Anual</button>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {planes.map((plan) => {
              const precio = selectedPeriodo === "anual" ? plan.precioAnual : plan.precioMensual;
              return (
                <div key={plan.id} className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedPlan === plan.id ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"}`} onClick={() => setSelectedPlan(plan.id)}>
                  <p className="font-bold text-lg">{plan.nombre}</p>
                  <p className="text-2xl font-bold mt-2">${Number(precio).toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/{selectedPeriodo === "anual" ? "año" : "mes"}</span></p>
                  {selectedPeriodo === "anual" && (
                    <p className="text-xs text-green-600 font-medium">Ahorra ${(Number(plan.precioMensual) * 12 - Number(plan.precioAnual)).toFixed(2)} al año</p>
                  )}
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <li>{plan.limiteFacturas ? `Hasta ${plan.limiteFacturas} facturas/mes` : "Facturas ilimitadas"}</li>
                    <li>{plan.limiteUsuarios ? `Hasta ${plan.limiteUsuarios} usuarios` : "Usuarios ilimitados"}</li>
                    <li>{plan.multiempresa ? "Multiempresa" : "1 empresa"}</li>
                    <li>{plan.reportesAvanzados ? "Reportes avanzados" : "Reportes básicos"}</li>
                    <li>{plan.apiAccess ? "API Access" : "Sin API"}</li>
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-2">
            {suscripcion && suscripcion.estado === "activa" ? (
              <form action={formActionChange} className="flex items-end gap-4">
                <input type="hidden" name="planId" value={selectedPlan} />
                <input type="hidden" name="periodo" value={selectedPeriodo} />
                <Button type="submit" disabled={changePending}>Programar Cambio de Plan</Button>
              </form>
            ) : (
              <form action={formActionOrder} className="flex items-end gap-4">
                <input type="hidden" name="planId" value={selectedPlan} />
                <input type="hidden" name="periodo" value={selectedPeriodo} />
                <div id="paypal-button-container">
                  <Button type="submit" disabled={orderPending}>
                    {orderPending ? "Procesando..." : "Pagar con PayPal"}
                  </Button>
                </div>
              </form>
            )}
            {orderState?.error && <p className="text-sm text-destructive">{orderState.error}</p>}
            {orderState?.success && <p className="text-sm text-green-600">{orderState.success}</p>}
            {changeState?.error && <p className="text-sm text-destructive">{changeState.error}</p>}
            {changeState?.success && <p className="text-sm text-green-600">{changeState.success}</p>}
          </div>

          {orderState?.orderId && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <p className="text-sm font-medium">Redirigiendo a PayPal...</p>
              <Button variant="outline" className="mt-2" onClick={() => window.open(`https://www.sandbox.paypal.com/checkoutnow?token=${orderState.orderId}`, "_blank")}>
                Ir a PayPal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {suscripcion && suscripcion.estado === "activa" && (
        <Card>
          <CardHeader><CardTitle>Cancelar Suscripción</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Al cancelar, tu suscripción quedará inactiva al finalizar el período pagado actual.</p>
            <form action={formActionCancel}>
              <Button variant="destructive" disabled={cancelPending}>Cancelar Suscripción</Button>
            </form>
            {cancelState?.error && <p className="text-sm text-destructive mt-2">{cancelState.error}</p>}
            {cancelState?.success && <p className="text-sm text-green-600 mt-2">{cancelState.success}</p>}
          </CardContent>
        </Card>
      )}

      {suscripcion?.pagos && suscripcion.pagos.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Historial de Pagos</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suscripcion.pagos.map((pago) => (
                <div key={pago.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">${Number(pago.monto).toFixed(2)} USD</p>
                    <p className="text-xs text-muted-foreground">{new Date(pago.creadoEn).toLocaleDateString("es-EC")}</p>
                  </div>
                  <Badge variant={pago.estado === "completado" ? "default" : "secondary"}>
                    {pago.estado === "completado" ? "Pagado" : pago.estado}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
