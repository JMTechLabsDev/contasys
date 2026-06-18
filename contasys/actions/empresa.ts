"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { empresaSchema } from "@/lib/validations/auth";

export type EmpresaState = {
  error?: string;
};

export async function cambiarEmpresa(formData: FormData) {
  const empresaId = formData.get("empresaId") as string;
  if (!empresaId) return;

  const cookieStore = await cookies();
  cookieStore.set("empresa_activa", empresaId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function crearEmpresa(
  _prevState: EmpresaState | null,
  formData: FormData,
): Promise<EmpresaState> {
  const parsed = empresaSchema.safeParse({
    nombre: formData.get("nombre"),
    razonSocial: formData.get("razonSocial"),
    ruc: formData.get("ruc"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    direccion: formData.get("direccion"),
    ciudad: formData.get("ciudad"),
    provincia: formData.get("provincia"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado" };
  }

  const existeRuc = await prisma.empresa.findUnique({
    where: { ruc: parsed.data.ruc },
  });

  if (existeRuc) {
    return { error: "Ya existe una empresa registrada con este RUC" };
  }

  const empresa = await prisma.empresa.create({
    data: {
      nombre: parsed.data.nombre,
      razonSocial: parsed.data.razonSocial,
      ruc: parsed.data.ruc,
      email: parsed.data.email || null,
      telefono: parsed.data.telefono || null,
      direccion: parsed.data.direccion || null,
      ciudad: parsed.data.ciudad || null,
      provincia: parsed.data.provincia || null,
      estado: "prueba",
    },
  });

  await prisma.usuario.upsert({
    where: { id: user.id },
    update: { nombre: user.user_metadata?.nombre || "" },
    create: {
      id: user.id,
      nombre: user.user_metadata?.nombre || "",
      email: user.email!,
    },
  });

  await prisma.empresaUsuario.create({
    data: {
      empresaId: empresa.id,
      usuarioId: user.id,
      rol: "propietario",
      aceptadoEn: new Date(),
    },
  });

  const planEmprendedor = await prisma.plan.findFirst({
    where: { nombre: "Emprendedor", activo: true },
    orderBy: { precioMensual: "asc" },
  });

  if (planEmprendedor) {
    await prisma.suscripcion.create({
      data: {
        empresaId: empresa.id,
        planId: planEmprendedor.id,
        estado: "trial",
        periodo: "mensual",
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
