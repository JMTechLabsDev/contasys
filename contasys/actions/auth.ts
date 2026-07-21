"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma/client";
import {
  loginSchema,
  registerSchema,
  recuperarSchema,
  restablecerSchema,
} from "@/lib/validations/auth";

export type AuthState = {
  error?: string;
  success?: boolean;
};

export async function register(
  _prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  try {
    const parsed = registerSchema.safeParse({
      nombre: formData.get("nombre"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmarPassword: formData.get("confirmarPassword"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { nombre, email, password } = parsed.data;

    const supabase = await createClient();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, rol_plataforma: "usuario" },
      },
    });

    if (authError) {
      return { error: authError.message };
    }

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function login(
  _prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      return { error: "Debes verificar tu correo electrónico antes de iniciar sesión" };
    }
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Correo o contraseña incorrectos" };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Error al obtener usuario" };

  const empresaUsuario = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true },
    include: { empresa: true },
  });

  if (!empresaUsuario) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}

export async function recuperar(
  _prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const parsed = recuperarSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email } = parsed.data;
  const origin = (await headers()).get("origin");

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/restablecer`,
  });

  if (error) {
    return { error: error.message };
  }

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

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { password } = parsed.data;

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/login");
}
