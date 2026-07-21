import { z } from "zod";

const password = z.string().min(8, "La contraseña debe tener al menos 8 caracteres");

export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export const registerSchema = z
  .object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Correo electrónico inválido"),
    password,
    confirmarPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });

export const recuperarSchema = z.object({ email: z.string().email("Correo electrónico inválido") });

export const restablecerSchema = z
  .object({ password, confirmarPassword: z.string() })
  .refine((data) => data.password === data.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });

export const empresaSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  razonSocial: z.string().min(2, "La razón social debe tener al menos 2 caracteres"),
  ruc: z.string().length(13, "El RUC debe tener 13 dígitos"),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  telefono: z.string().optional().or(z.literal("")),
  direccion: z.string().optional().or(z.literal("")),
  ciudad: z.string().optional().or(z.literal("")),
  provincia: z.string().optional().or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RecuperarInput = z.infer<typeof recuperarSchema>;
export type RestablecerInput = z.infer<typeof restablecerSchema>;
export type EmpresaInput = z.infer<typeof empresaSchema>;
