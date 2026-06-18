export interface SriResponse {
  estado: "AUTORIZADO" | "RECHAZADO" | "EN_PROCESO";
  claveAcceso: string;
  numeroAutorizacion?: string;
  fechaAutorizacion?: string;
  mensajes?: SriMensaje[];
}

export interface SriMensaje {
  identificador: string;
  mensaje: string;
  tipo: "INFORMATIVO" | "ERROR" | "ADVERTENCIA";
}

export interface SriXmlRide {
  claveAcceso: string;
  numeroFactura: string;
  fechaEmision: string;
  razonSocial: string;
  ruc: string;
  total: number;
  ambiente: "1" | "2";
  tipoEmision: "1";
}
