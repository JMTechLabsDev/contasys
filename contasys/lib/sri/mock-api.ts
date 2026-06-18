type SriResponse = {
  estado: "AUTORIZADO" | "RECHAZADO" | "EN_PROCESO";
  numeroAutorizacion?: string;
  fechaAutorizacion?: string;
  errores?: Array<{ codigo: string; mensaje: string }>;
  ambiente: "pruebas" | "produccion";
};

function generarNumeroAutorizacion(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${timestamp}${random}`.padEnd(40, "0").slice(0, 40);
}

function shouldAutoApprove(claveAcceso: string): boolean {
  const lastDigit = parseInt(claveAcceso[claveAcceso.length - 1], 10);
  return lastDigit >= 0 && lastDigit <= 7;
}

export async function autorizarComprobanteSRI(
  claveAcceso: string,
  xmlContent: string,
  ambiente: "pruebas" | "produccion",
): Promise<SriResponse> {
  await new Promise((r) => setTimeout(r, 1500 + Math.random() * 2000));

  const approved = shouldAutoApprove(claveAcceso);

  if (approved) {
    return {
      estado: "AUTORIZADO",
      numeroAutorizacion: generarNumeroAutorizacion(),
      fechaAutorizacion: new Date().toISOString(),
      ambiente,
    };
  }

  return {
    estado: "RECHAZADO",
    errores: [
      { codigo: "SRI-MOCK-001", mensaje: "Comprobante con errores: verifique los datos del comprobante" },
    ],
    ambiente,
  };
}
