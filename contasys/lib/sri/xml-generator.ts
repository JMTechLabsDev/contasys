import { generarClaveAcceso } from "./clave-acceso";

type FacturaData = {
  numeroFactura: string;
  claveAcceso?: string;
  fechaEmision: Date;
  tipoComprobante: string;
  subtotal: number;
  descuento: number;
  subtotalSinImpuesto: number;
  iva: number;
  total: number;
  metodoPago?: string | null;
  observaciones?: string | null;
  cliente: {
    tipoIdentificacion: string;
    identificacion: string;
    nombre: string;
    razonSocial?: string | null;
    direccion?: string | null;
    email?: string | null;
    telefono?: string | null;
  };
  items: Array<{
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    subtotal: number;
    iva: number;
    total: number;
  }>;
  empresa: {
    ruc: string;
    razonSocial: string;
    nombreComercial?: string;
    direccion: string;
    ciudad: string;
    provincia: string;
    telefono?: string;
    email?: string;
    regimenTributario?: string;
    tipoContribuyente?: string;
    obligadoContabilidad?: boolean;
  };
  ambiente: "pruebas" | "produccion";
  serie: string;
};

export function facturaIdFromNumero(numero: string, serie: string): string {
  const num = numero.replace(/\D/g, "").slice(-9).padStart(9, "0");
  return `${serie.padStart(3, "0")}-${num}`;
}

export function generarXMLFactura(data: FacturaData): string {
  const claveAcceso = data.claveAcceso || generarClaveAcceso({
    ruc: data.empresa.ruc,
    tipoComprobante: data.tipoComprobante,
    serie: data.serie,
    numeroFactura: data.numeroFactura,
    fechaEmision: data.fechaEmision,
    ambiente: data.ambiente,
  });

  const fecha = new Date(data.fechaEmision);
  const fechaStr = `${String(fecha.getDate()).padStart(2, "0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}/${fecha.getFullYear()}`;

  const tipoIdMap: Record<string, string> = {
    ruc: "04",
    cedula: "05",
    pasaporte: "06",
    consumidor_final: "07",
    placa: "08",
  };
  const codTipoId = tipoIdMap[data.cliente.tipoIdentificacion] || "05";

  const totalSinImpuestos = data.subtotal.toFixed(2);
  const totalDescuento = data.descuento.toFixed(2);
  const ivaValor = data.iva.toFixed(2);
  const importeTotal = data.total.toFixed(2);
  const subtotaliva = (data.subtotalSinImpuesto - data.iva).toFixed(2);
  const baseImponibleIva = data.subtotalSinImpuesto.toFixed(2);

  const metodoPagoMap: Record<string, string> = {
    efectivo: "01",
    transferencia: "16",
    tarjeta: "19",
    credito: "20",
    cheque: "02",
    otros: "01",
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="1.1.0">
  <infoTributaria>
    <ambiente>${data.ambiente === "produccion" ? "1" : "2"}</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>${escapeXml(data.empresa.razonSocial)}</razonSocial>
    <nombreComercial>${escapeXml(data.empresa.nombreComercial || data.empresa.razonSocial)}</nombreComercial>
    <ruc>${data.empresa.ruc}</ruc>
    <claveAcceso>${claveAcceso}</claveAcceso>
    <codDoc>01</codDoc>
    <estab>${data.serie}</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>${data.numeroFactura.replace(/\D/g, "").slice(-9).padStart(9, "0")}</secuencial>
    <dirMatriz>${escapeXml(data.empresa.direccion)}</dirMatriz>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>${fechaStr}</fechaEmision>
    <dirEstablecimiento>001</dirEstablecimiento>
    <obligadoContabilidad>${data.empresa.obligadoContabilidad ? "SI" : "NO"}</obligadoContabilidad>
    <tipoIdentificacionComprador>${codTipoId}</tipoIdentificacionComprador>
    <razonSocialComprador>${escapeXml(data.cliente.razonSocial || data.cliente.nombre)}</razonSocialComprador>
    <identificacionComprador>${data.cliente.identificacion}</identificacionComprador>
    <direccionComprador>${escapeXml(data.cliente.direccion || "")}</direccionComprador>
    <totalSinImpuestos>${totalSinImpuestos}</totalSinImpuestos>
    <totalDescuento>${totalDescuento}</totalDescuento>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>2</codigoPorcentaje>
        <baseImponible>${baseImponibleIva}</baseImponible>
        <valor>${ivaValor}</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <importeTotal>${importeTotal}</importeTotal>
    <moneda>USD</moneda>
    <pagos>
      <pago>
        <formaPago>${metodoPagoMap[data.metodoPago?.toLowerCase() || ""] || "01"}</formaPago>
        <total>${importeTotal}</total>
        <plazo>0</plazo>
        <unidadTiempo>dias</unidadTiempo>
      </pago>
    </pagos>
  </infoFactura>
  <detalles>
    ${data.items.map((item, i) => `
    <detalle>
      <codigoPrincipal>${String(i + 1).padStart(6, "0")}</codigoPrincipal>
      <descripcion>${escapeXml(item.descripcion)}</descripcion>
      <cantidad>${item.cantidad}</cantidad>
      <precioUnitario>${item.precioUnitario.toFixed(2)}</precioUnitario>
      <descuento>${item.descuento.toFixed(2)}</descuento>
      <precioTotalSinImpuesto>${item.subtotal.toFixed(2)}</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>${item.iva > 0 ? "2" : "0"}</codigoPorcentaje>
          <tarifa>${item.iva > 0 ? "15.00" : "0.00"}</tarifa>
          <baseImponible>${item.subtotal.toFixed(2)}</baseImponible>
          <valor>${item.iva.toFixed(2)}</valor>
        </impuesto>
      </impuestos>
    </detalle>`).join("\n")}
  </detalles>
  ${data.observaciones ? `<infoAdicional>
    <campoAdicional nombre="Observacion">${escapeXml(data.observaciones)}</campoAdicional>
  </infoAdicional>` : ""}
</factura>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
