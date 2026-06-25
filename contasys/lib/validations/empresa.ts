import { z } from "zod";

export const empresaUpdateSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  razonSocial: z.string().min(2, "La razón social debe tener al menos 2 caracteres"),
  ruc: z.string().length(13, "El RUC debe tener 13 dígitos"),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  telefono: z.string().optional().or(z.literal("")),
  direccion: z.string().optional().or(z.literal("")),
  ciudad: z.string().optional().or(z.literal("")),
  provincia: z.string().optional().or(z.literal("")),
  regimenTributario: z.string().optional().or(z.literal("")),
  tipoContribuyente: z.string().optional().or(z.literal("")),
});

export const numeracionSchema = z.object({
  prefijo: z.string().min(1, "El prefijo es requerido"),
  secuencia: z.coerce.number().int().min(1),
});

export const configuracionSchema = z.object({
  numeracion: z.object({
    factura: numeracionSchema.optional(),
    notaCredito: numeracionSchema.optional(),
    notaDebito: numeracionSchema.optional(),
    retencion: numeracionSchema.optional(),
    guiaRemision: numeracionSchema.optional(),
  }).optional(),
  metodosPago: z.array(z.string()).optional(),
  impuestos: z.array(z.object({
    porcentaje: z.coerce.number().min(0).max(100),
    nombre: z.string().min(1),
    activo: z.boolean(),
  })).optional(),
  emailNotificaciones: z.object({
    host: z.string().optional().or(z.literal("")),
    port: z.coerce.number().int().optional(),
    user: z.string().optional().or(z.literal("")),
    pass: z.string().optional().or(z.literal("")),
    fromName: z.string().optional().or(z.literal("")),
    fromEmail: z.string().email().optional().or(z.literal("")),
  }).optional(),
});

export const invitarUsuarioSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  rol: z.enum(["administrador", "gerente", "contador", "facturacion", "vendedor"]),
});

export type EmpresaUpdateInput = z.infer<typeof empresaUpdateSchema>;
export type ConfiguracionInput = z.infer<typeof configuracionSchema>;
export type InvitarUsuarioInput = z.infer<typeof invitarUsuarioSchema>;
