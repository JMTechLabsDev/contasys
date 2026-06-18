function digitoVerificador(clave: string): string {
  const factores = [2, 3, 4, 5, 6, 7];
  let suma = 0;
  for (let i = 0; i < clave.length; i++) {
    const factor = factores[(clave.length - 1 - i) % factores.length];
    suma += parseInt(clave[i]) * factor;
  }
  const modulo = suma % 11;
  const resto = 11 - modulo;
  if (resto === 11) return "0";
  if (resto === 10) return "1";
  return String(resto);
}

export function generarClaveAcceso(opts: {
  ruc: string;
  tipoComprobante: string;
  serie: string;
  numeroFactura: string;
  fechaEmision: Date;
  ambiente: "pruebas" | "produccion";
}): string {
  const fecha = new Date(opts.fechaEmision);
  const dd = String(fecha.getDate()).padStart(2, "0");
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const yyyy = String(fecha.getFullYear());

  const tipoMap: Record<string, string> = {
    factura: "01",
    nota_credito: "04",
    nota_debito: "05",
    retencion: "07",
    guia_remision: "06",
  };
  const tipoCod = tipoMap[opts.tipoComprobante] || "01";

  const numeroPadded = opts.numeroFactura.replace(/\D/g, "").padStart(9, "0");
  const codigoNumerico = String(Math.floor(Math.random() * 90000000) + 10000000);
  const ambienteCod = opts.ambiente === "produccion" ? "1" : "2";
  const emisionCod = "1";
  const moneda = "USD";

  const base =
    dd + mm + yyyy +
    tipoCod +
    opts.ruc.replace(/\D/g, "").padStart(13, "0").slice(0, 13) +
    ambienteCod +
    opts.serie.padStart(3, "0") +
    numeroPadded +
    codigoNumerico +
    tipoCod +
    emisionCod;

  const dv = digitoVerificador(base);

  return base + dv;
}
