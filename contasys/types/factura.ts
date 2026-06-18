export interface FacturaFormData {
  clienteId: string;
  fechaEmision?: string;
  tipoComprobante: "factura" | "nota_credito" | "nota_debito" | "retencion" | "guia_remision";
  metodoPago?: string;
  observaciones?: string;
  items: FacturaItemFormData[];
}

export interface FacturaItemFormData {
  productoId?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
}

export interface CalculatedFactura {
  subtotal: number;
  descuento: number;
  subtotalSinImpuesto: number;
  iva: number;
  total: number;
}
