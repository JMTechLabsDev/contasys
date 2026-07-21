"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { loginSchema, recuperarSchema, restablecerSchema } from "@/lib/validations/auth";

export type AuthState = { error?: string; success?: boolean };

export async function login(_prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.message.includes("Email not confirmed"))
      return { error: "Debes verificar tu correo electrónico antes de iniciar sesión." };
    if (error.message.includes("Invalid login credentials"))
      return { error: "Correo o contraseña incorrectos." };
    return { error: "No fue posible iniciar sesión. Inténtalo nuevamente." };
  }

  revalidatePath("/", "layout");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No fue posible obtener la sesión." };
  const empresaUsuario = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true },
  });
  redirect(empresaUsuario ? "/dashboard" : "/onboarding");
}

export async function recuperar(
  _prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const parsed = recuperarSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    // La plantilla "Reset password" añade /auth/confirm y el tipo recovery.
    redirectTo: origin?.replace(/\/$/, ""),
  });
  if (error) return { error: "No fue posible enviar el correo. Inténtalo nuevamente." };
  return { success: true };
}

export async function restablecer(
  _prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const parsed = restablecerSchema.safeParse({
    password: formData.get("password"),
    confirmarPassword: formData.get("confirmarPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: "No fue posible cambiar la contraseña. Solicita un enlace nuevo." };
  redirect("/login");
}
