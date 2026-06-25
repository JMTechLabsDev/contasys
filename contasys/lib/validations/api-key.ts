import { z } from "zod";

export const crearApiKeySchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre es muy largo"),
  permisos: z.enum(["clientes", "productos", "facturas", "reportes", "empresas"]).array().default(["clientes", "productos", "facturas"]),
});

export type CrearApiKeyInput = z.infer<typeof crearApiKeySchema>;
