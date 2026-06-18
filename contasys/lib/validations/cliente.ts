import { z } from "zod";

export const clienteSchema = z.object({
  tipoIdentificacion: z.enum(["ruc", "cedula", "pasaporte"]),
  identificacion: z.string().min(5, "La identificación debe tener al menos 5 caracteres"),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  razonSocial: z.string().optional().or(z.literal("")),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  telefono: z.string().optional().or(z.literal("")),
  direccion: z.string().optional().or(z.literal("")),
  ciudad: z.string().optional().or(z.literal("")),
  provincia: z.string().optional().or(z.literal("")),
});

export type ClienteInput = z.infer<typeof clienteSchema>;
