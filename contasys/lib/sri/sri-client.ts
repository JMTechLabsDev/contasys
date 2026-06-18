const SRI_WSDL = {
  pruebas: {
    recepcion: "https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantes?wsdl",
    autorizacion: "https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantes?wsdl",
  },
  produccion: {
    recepcion: "https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantes?wsdl",
    autorizacion: "https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantes?wsdl",
  },
};

function buildRecepcionSoapEnvelope(xmlComprobante: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <validarComprobante xmlns="http://ec.gob.sri.ws.recepcion">
      <xml>${escapeXml(xmlComprobante)}</xml>
    </validarComprobante>
  </soap:Body>
</soap:Envelope>`;
}

function buildAutorizacionSoapEnvelope(claveAcceso: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <autorizacionComprobante xmlns="http://ec.gob.sri.ws.autorizacion">
      <claveAccesoComprobante>${claveAcceso}</claveAccesoComprobante>
    </autorizacionComprobante>
  </soap:Body>
</soap:Envelope>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type SriSoapResponse = {
  estado: string;
  numeroAutorizacion?: string;
  fechaAutorizacion?: string;
  errores?: Array<{ codigo: string; mensaje: string }>;
};

function parseSoapResponse(xml: string): SriSoapResponse {
  const estadoMatch = xml.match(/<estado>([^<]+)<\/estado>/);
  const estado = estadoMatch ? estadoMatch[1] : "RECHAZADO";

  const numAuthMatch = xml.match(/<numeroAutorizacion[^>]*>([^<]*)<\/numeroAutorizacion>/);
  const numeroAutorizacion = numAuthMatch ? numAuthMatch[1] : undefined;

  const fechaAuthMatch = xml.match(/<fechaAutorizacion[^>]*>([^<]*)<\/fechaAutorizacion>/);
  const fechaAutorizacion = fechaAuthMatch ? fechaAuthMatch[1] : undefined;

  const errores: Array<{ codigo: string; mensaje: string }> = [];
  const simpleMsgRegex = /<mensaje[^>]*>([^<]*)<\/mensaje>/g;
  let m;
  while ((m = simpleMsgRegex.exec(xml)) !== null) {
    errores.push({ codigo: "SRI-ERR", mensaje: m[1] });
  }

  return { estado, numeroAutorizacion, fechaAutorizacion, errores: errores.length ? errores : undefined };
}

export async function enviarComprobanteSRI(
  xmlFirmado: string,
  ambiente: "pruebas" | "produccion" = "pruebas",
): Promise<{ estado: string; numeroAutorizacion?: string; fechaAutorizacion?: string; errores?: Array<{ codigo: string; mensaje: string }>; error?: string }> {
  const env = SRI_WSDL[ambiente];
  const timeoutMs = 30000;

  try {
    const recepcionBody = buildRecepcionSoapEnvelope(xmlFirmado);
    const recepcionResp = await fetch(env.recepcion, {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=utf-8", SOAPAction: "" },
      body: recepcionBody,
      signal: AbortSignal.timeout(timeoutMs),
    });

    const recepcionXml = await recepcionResp.text();
    const recepcionResult = parseSoapResponse(recepcionXml);

    if (recepcionResult.estado !== "AUTORIZADO" && recepcionResult.estado !== "RECIBIDA") {
      return {
        estado: "RECHAZADO",
        errores: recepcionResult.errores || [{ codigo: "SRI-REC", mensaje: "Comprobante no recibido por el SRI" }],
        error: "Recepción fallida",
      };
    }

    await new Promise((r) => setTimeout(r, 2000));

    const claveMatch = xmlFirmado.match(/<claveAcceso[^>]*>([^<]+)<\/claveAcceso>/i);
    const claveAcceso = claveMatch ? claveMatch[1] : "";

    if (!claveAcceso) {
      return { estado: "RECHAZADO", errores: [{ codigo: "SRI-XML", mensaje: "No se pudo extraer clave de acceso del XML" }], error: "No se pudo extraer clave de acceso del XML" };
    }

    const authBody = buildAutorizacionSoapEnvelope(claveAcceso);
    const authResp = await fetch(env.autorizacion, {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=utf-8", SOAPAction: "" },
      body: authBody,
      signal: AbortSignal.timeout(timeoutMs),
    });

    const authXml = await authResp.text();
    const authResult = parseSoapResponse(authXml);

    return authResult;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error de conexión con SRI";
    return { estado: "RECHAZADO", error: msg, errores: [{ codigo: "SRI-NET", mensaje: msg }] };
  }
}
