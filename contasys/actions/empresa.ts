"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { empresaSchema } from "@/lib/validations/auth";

export type EmpresaState = { error?: string } | null;

export async function crearEmpresa(_prevState: EmpresaState, formData: FormData): Promise<EmpresaState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

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

  const data = parsed.data;

  try {
    const [empresa] = await Promise.all([
      prisma.empresa.create({
        data: {
          nombre: data.nombre,
          razonSocial: data.razonSocial,
          ruc: data.ruc,
          email: data.email || null,
          telefono: data.telefono || null,
          direccion: data.direccion || null,
          ciudad: data.ciudad || null,
          provincia: data.provincia || null,
          ambiente: "produccion",
          estado: "prueba",
        },
      }),
    ]);

    await prisma.empresaUsuario.create({
      data: {
        empresaId: empresa.id,
        usuarioId: user.id,
        rol: "propietario",
      },
    });

    await prisma.suscripcion.create({
      data: {
        empresaId: empresa.id,
        planId: null as any,
        estado: "trial",
        periodo: "mensual",
        fechaFin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return { error: "El RUC ya está registrado por otra empresa" };
    }
    return { error: "Error al crear la empresa" };
  }

  revalidatePath("/onboarding");
  redirect("/dashboard");
}


