"use client";

import { useState } from "react";
import { useActionState } from "react";
import { actualizarEmpresa, actualizarConfiguracion } from "@/actions/empresa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Empresa = {
  id: string; nombre: string; razonSocial: string; ruc: string;
  email: string | null; telefono: string | null; direccion: string | null;
  ciudad: string | null; provincia: string | null;
  regimenTributario: string | null; tipoContribuyente: string | null;
  logoUrl: string | null; ambiente: string;
};

type Numeracion = { prefijo: string; secuencia: number };
type Config = {
  numeracion?: Record<string, Numeracion>;
  metodosPago?: string[];
  impuestos?: { porcentaje: number; nombre: string; activo: boolean }[];
  emailNotificaciones?: { host?: string; port?: number; user?: string; pass?: string; fromName?: string; fromEmail?: string };
};

export function EmpresaConfigClient({ empresa, config }: { empresa: Empresa; config: Config | null }) {
  const [empresaState, formActionEmpresa, empPending] = useActionState(actualizarEmpresa, null);
  const [configState, formActionConfig, cfgPending] = useActionState(actualizarConfiguracion, null);

  const [numeracion, setNumeracion] = useState<Record<string, Numeracion>>(config?.numeracion ?? {
    factura: { prefijo: "001-001-", secuencia: 1 },
    notaCredito: { prefijo: "001-002-", secuencia: 1 },
    notaDebito: { prefijo: "001-003-", secuencia: 1 },
    retencion: { prefijo: "001-004-", secuencia: 1 },
    guiaRemision: { prefijo: "001-005-", secuencia: 1 },
  });
  const [metodosPago, setMetodosPago] = useState<string[]>(config?.metodosPago ?? ["Efectivo", "Transferencia", "Tarjeta", "Cheque"]);
  const [nuevoMetodo, setNuevoMetodo] = useState("");
  const [impuestos, setImpuestos] = useState<{ porcentaje: number; nombre: string; activo: boolean }[]>(
    config?.impuestos ?? [
      { porcentaje: 15, nombre: "IVA 15%", activo: true },
      { porcentaje: 0, nombre: "IVA 0%", activo: true },
      { porcentaje: 12, nombre: "IVA 12%", activo: false },
    ]
  );
  const [emailCfg, setEmailCfg] = useState(config?.emailNotificaciones ?? { host: "", port: 587, user: "", pass: "", fromName: "", fromEmail: "" });

  const guardarConfig = async () => {
    const fd = new FormData();
    fd.set("configuracion", JSON.stringify({ numeracion, metodosPago, impuestos, emailNotificaciones: emailCfg }));
    formActionConfig(fd);
  };

  const agregarMetodoPago = () => {
    if (nuevoMetodo && !metodosPago.includes(nuevoMetodo)) {
      setMetodosPago([...metodosPago, nuevoMetodo]);
      setNuevoMetodo("");
    }
  };

  const toggleImpuesto = (idx: number) => {
    setImpuestos(impuestos.map((i, n) => n === idx ? { ...i, activo: !i.activo } : i));
  };

  const actualizarNumeracion = (tipo: string, field: keyof Numeracion, value: string | number) => {
    setNumeracion({ ...numeracion, [tipo]: { ...numeracion[tipo], [field]: value } });
  };

  const tabs = ["general", "numeracion", "impuestos", "metodos-pago", "email"];
  const tabLabels: Record<string, string> = {
    general: "General", numeracion: "Numeración", impuestos: "Impuestos",
    "metodos-pago": "Métodos de Pago", email: "Email",
  };
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración de Empresa</h1>
        <p className="text-muted-foreground">Administra los datos y preferencias de tu empresa</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b">
        {tabs.map((t) => (
          <button key={t} type="button" onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >{tabLabels[t]}</button>
        ))}
      </div>

      {activeTab === "general" && (
        <Card>
          <CardHeader><CardTitle>Datos Generales</CardTitle></CardHeader>
          <CardContent>
            <form action={formActionEmpresa} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Comercial</Label>
                <Input id="nombre" name="nombre" defaultValue={empresa.nombre} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="razonSocial">Razón Social</Label>
                <Input id="razonSocial" name="razonSocial" defaultValue={empresa.razonSocial} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruc">RUC</Label>
                <Input id="ruc" name="ruc" defaultValue={empresa.ruc} required maxLength={13} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={empresa.email ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" name="telefono" defaultValue={empresa.telefono ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regimenTributario">Régimen Tributario</Label>
                <Input id="regimenTributario" name="regimenTributario" defaultValue={empresa.regimenTributario ?? ""} placeholder="Ej: RIMPE" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoContribuyente">Tipo Contribuyente</Label>
                <Input id="tipoContribuyente" name="tipoContribuyente" defaultValue={empresa.tipoContribuyente ?? ""} placeholder="Ej: Persona Natural" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input id="ciudad" name="ciudad" defaultValue={empresa.ciudad ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provincia">Provincia</Label>
                <Input id="provincia" name="provincia" defaultValue={empresa.provincia ?? ""} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" name="direccion" defaultValue={empresa.direccion ?? ""} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Ambiente SRI</Label>
                <Badge variant={empresa.ambiente === "produccion" ? "default" : "secondary"}>
                  {empresa.ambiente === "produccion" ? "Producción" : "Pruebas"}
                </Badge>
              </div>
              {empresaState?.error && (
                <p className="md:col-span-2 text-sm text-destructive">{empresaState.error}</p>
              )}
              <div className="md:col-span-2">
                <Button type="submit" disabled={empPending}>Guardar Cambios</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "numeracion" && (
        <Card>
          <CardHeader><CardTitle>Numeración de Comprobantes</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">Define los prefijos y secuencias para cada tipo de comprobante.</p>
            {["factura", "notaCredito", "notaDebito", "retencion", "guiaRemision"].map((tipo) => {
              const labels: Record<string, string> = {
                factura: "Factura", notaCredito: "Nota de Crédito", notaDebito: "Nota de Débito",
                retencion: "Retención", guiaRemision: "Guía de Remisión",
              };
              return (
                <div key={tipo} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <p className="font-medium md:col-span-2">{labels[tipo]}</p>
                  <div className="space-y-2">
                    <Label>Prefijo</Label>
                    <Input value={numeracion[tipo]?.prefijo ?? ""} onChange={(e) => actualizarNumeracion(tipo, "prefijo", e.target.value)} placeholder="Ej: 001-001-" />
                  </div>
                  <div className="space-y-2">
                    <Label>Secuencia Actual</Label>
                    <Input type="number" value={numeracion[tipo]?.secuencia ?? 1} onChange={(e) => actualizarNumeracion(tipo, "secuencia", parseInt(e.target.value) || 1)} min={1} />
                  </div>
                </div>
              );
            })}
            <Button onClick={guardarConfig} disabled={cfgPending}>Guardar Numeración</Button>
            {configState?.error && <p className="text-sm text-destructive">{configState.error}</p>}
          </CardContent>
        </Card>
      )}

      {activeTab === "impuestos" && (
        <Card>
          <CardHeader><CardTitle>Configuración de Impuestos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Activa o desactiva los impuestos disponibles al facturar.</p>
            {impuestos.map((imp, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{imp.nombre}</p>
                  <p className="text-sm text-muted-foreground">{imp.porcentaje}%</p>
                </div>
                <button type="button" onClick={() => toggleImpuesto(idx)} className={`px-3 py-1 rounded text-xs font-medium ${imp.activo ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{imp.activo ? "Activo" : "Inactivo"}</button>
              </div>
            ))}
            <Button onClick={guardarConfig} disabled={cfgPending}>Guardar Impuestos</Button>
            {configState?.error && <p className="text-sm text-destructive">{configState.error}</p>}
          </CardContent>
        </Card>
      )}

      {activeTab === "metodos-pago" && (
        <Card>
          <CardHeader><CardTitle>Métodos de Pago</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Administra los métodos de pago disponibles al crear facturas.</p>
            <div className="flex gap-2">
              <Input value={nuevoMetodo} onChange={(e) => setNuevoMetodo(e.target.value)} placeholder="Nuevo método de pago..." />
              <Button type="button" variant="outline" onClick={agregarMetodoPago}>Agregar</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {metodosPago.map((m) => (
                <Badge key={m} variant="secondary" className="gap-1">
                  {m}
                  <button onClick={() => setMetodosPago(metodosPago.filter((x) => x !== m))} className="ml-1 hover:text-destructive">&times;</button>
                </Badge>
              ))}
            </div>
            <Button onClick={guardarConfig} disabled={cfgPending}>Guardar Métodos de Pago</Button>
            {configState?.error && <p className="text-sm text-destructive">{configState.error}</p>}
          </CardContent>
        </Card>
      )}

      {activeTab === "email" && (
        <Card>
          <CardHeader><CardTitle>Configuración de Correo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Configura el servidor SMTP para envío de facturas y notificaciones.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Servidor SMTP</Label>
                <Input value={emailCfg.host} onChange={(e) => setEmailCfg({ ...emailCfg, host: e.target.value })} placeholder="smtp.gmail.com" />
              </div>
              <div className="space-y-2">
                <Label>Puerto</Label>
                <Input type="number" value={emailCfg.port} onChange={(e) => setEmailCfg({ ...emailCfg, port: parseInt(e.target.value) || 587 })} />
              </div>
              <div className="space-y-2">
                <Label>Usuario</Label>
                <Input value={emailCfg.user} onChange={(e) => setEmailCfg({ ...emailCfg, user: e.target.value })} placeholder="tu@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <Input type="password" value={emailCfg.pass} onChange={(e) => setEmailCfg({ ...emailCfg, pass: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nombre Remitente</Label>
                <Input value={emailCfg.fromName} onChange={(e) => setEmailCfg({ ...emailCfg, fromName: e.target.value })} placeholder="Mi Empresa" />
              </div>
              <div className="space-y-2">
                <Label>Email Remitente</Label>
                <Input type="email" value={emailCfg.fromEmail} onChange={(e) => setEmailCfg({ ...emailCfg, fromEmail: e.target.value })} placeholder="facturas@miempresa.com" />
              </div>
            </div>
            <Button onClick={guardarConfig} disabled={cfgPending}>Guardar Configuración de Email</Button>
            {configState?.error && <p className="text-sm text-destructive">{configState.error}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
