"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { crearApiKeySchema } from "@/lib/validations/api-key";
import { generateApiKey, hashString } from "@/lib/hash";

type ApiKeyActionResult = { error?: string; apiKey?: string; nombre?: string };

async function getEmpresaId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get("empresa_activa")?.value;

  const eu = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true, ...(empresaActivaId ? { empresaId: empresaActivaId } : {}) },
  });
  return eu?.empresaId ?? null;
}

export async function generarApiKey(
  _prevState: ApiKeyActionResult | null,
  formData: FormData,
): Promise<ApiKeyActionResult> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const parsed = crearApiKeySchema.safeParse({
    nombre: formData.get("nombre"),
    permisos: formData.getAll("permisos"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const rawKey = generateApiKey();
  const claveHash = hashString(rawKey);

  await prisma.apiKey.create({
    data: {
      empresaId,
      nombre: parsed.data.nombre,
      claveHash,
      permisos: parsed.data.permisos,
    },
  });

  revalidatePath("/configuracion/api-keys");
  return { apiKey: rawKey, nombre: parsed.data.nombre };
}

export async function revocarApiKey(_prevState: unknown, formData: FormData) {
  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const id = formData.get("id") as string;
  if (!id) return { error: "ID requerido" };

  await prisma.apiKey.updateMany({
    where: { id, empresaId },
    data: { activa: false },
  });

  revalidatePath("/configuracion/api-keys");
  return { success: true };
}
