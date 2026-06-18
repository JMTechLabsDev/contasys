import { z } from "zod";

export const productoSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  sku: z.string().optional().or(z.literal("")),
  descripcion: z.string().optional().or(z.literal("")),
  categoria: z.string().optional().or(z.literal("")),
  precio: z.coerce.number().positive("El precio debe ser mayor a 0"),
  costo: z.coerce.number().min(0, "El costo no puede ser negativo").optional().or(z.literal("")),
  impuesto: z.enum(["0%", "15%", "exento"]),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo").optional().or(z.literal("")),
});

export const importarProductosSchema = z.array(
  z.object({
    nombre: z.string().min(2),
    sku: z.string().optional().default(""),
    descripcion: z.string().optional().default(""),
    categoria: z.string().optional().default(""),
    precio: z.coerce.number().positive(),
    costo: z.coerce.number().min(0).optional().default(0),
    impuesto: z.enum(["0%", "15%", "exento"]).default("15%"),
    stock: z.coerce.number().int().min(0).optional().default(0),
  }),
);

export type ProductoInput = z.infer<typeof productoSchema>;

export const CATEGORIAS = [
  "Productos",
  "Servicios",
  "Alimentos",
  "Bebidas",
  "Ropa y Accesorios",
  "Electrónica",
  "Hogar",
  "Salud y Belleza",
  "Deportes",
  "Juguetes",
  "Libros y Papelería",
  "Transporte",
  "Tecnología",
  "Consultoría",
  "Otros",
] as const;
