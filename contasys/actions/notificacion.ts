"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

export async function crearNotificacion(params: { empresaId: string; usuarioId: string; tipo: string; titulo: string; mensaje?: string; url?: string }) {
  await prisma.notificacion.create({ data: params });
}

export async function crearNotificacionEmpresa(empresaId: string, tipo: string, titulo: string, mensaje?: string, url?: string) {
  const usuarios = await prisma.empresaUsuario.findMany({
    where: { empresaId, activo: true },
    select: { usuarioId: true },
  });
  for (const u of usuarios) {
    await prisma.notificacion.create({ data: { empresaId, usuarioId: u.usuarioId, tipo, titulo, mensaje, url } });
  }
}

export async function marcarLeida(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const id = formData.get("id") as string;
  if (!id) return null;

  await prisma.notificacion.updateMany({
    where: { id, usuarioId: user.id },
    data: { leida: true },
  });
  revalidatePath("/", "layout");
  return null;
}

export async function marcarTodasLeidas(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  await prisma.notificacion.updateMany({
    where: { usuarioId: user.id, leida: false },
    data: { leida: true },
  });
  revalidatePath("/", "layout");
  return null;
}

export async function eliminarNotificacion(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const id = formData.get("id") as string;
  if (!id) return null;

  await prisma.notificacion.deleteMany({
    where: { id, usuarioId: user.id },
  });
  revalidatePath("/", "layout");
  return null;
}
