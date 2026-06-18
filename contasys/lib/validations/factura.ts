import { z } from "zod";

export const facturaItemSchema = z.object({
  productoId: z.string().optional().or(z.literal("")),
  descripcion: z.string().min(1, "La descripción del item es requerida"),
  cantidad: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
  precioUnitario: z.coerce.number().positive("El precio unitario debe ser mayor a 0"),
  descuento: z.coerce.number().min(0).default(0),
  impuesto: z.enum(["0%", "15%", "exento"]).default("15%"),
});

export const facturaSchema = z.object({
  clienteId: z.string().min(1, "Selecciona un cliente"),
  tipoComprobante: z.enum(["factura", "nota_credito", "nota_debito", "retencion", "guia_remision"]).default("factura"),
  metodoPago: z.string().optional().or(z.literal("")),
  observaciones: z.string().optional().or(z.literal("")),
  descuentoGlobal: z.coerce.number().min(0).default(0),
  items: z.array(facturaItemSchema).min(1, "Agrega al menos un item a la factura"),
});

export type FacturaInput = z.infer<typeof facturaSchema>;
export type FacturaItemInput = z.infer<typeof facturaItemSchema>;
