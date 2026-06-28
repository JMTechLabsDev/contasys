"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma/client";

async function verificarSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const usuario = await prisma.usuario.findUnique({ where: { id: user.id }, select: { rolPlataforma: true } });
  if (!usuario || usuario.rolPlataforma !== "superadmin") throw new Error("Acceso denegado");
  return user.id;
}

export async function suspenderUsuario(_prevState: unknown, formData: FormData) {
  try {
    await verificarSuperAdmin();
    const id = formData.get("id") as string;
    if (!id) return { error: "ID requerido" };

    const adminClient = createAdminClient();
    await adminClient.auth.admin.updateUserById(id, { ban_duration: "876000h" });

    await prisma.usuario.update({ where: { id }, data: { rolPlataforma: "usuario" } });
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al suspender" };
  }
}

export async function reactivarUsuario(_prevState: unknown, formData: FormData) {
  try {
    await verificarSuperAdmin();
    const id = formData.get("id") as string;
    if (!id) return { error: "ID requerido" };

    const adminClient = createAdminClient();
    await adminClient.auth.admin.updateUserById(id, { ban_duration: "0s" });

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al reactivar" };
  }
}

export async function eliminarUsuario(_prevState: unknown, formData: FormData) {
  try {
    await verificarSuperAdmin();
    const id = formData.get("id") as string;
    if (!id) return { error: "ID requerido" };
    if (id === await verificarSuperAdmin()) return { error: "No puedes eliminarte a ti mismo" };

    const adminClient = createAdminClient();
    await adminClient.auth.admin.deleteUser(id);

    await prisma.usuario.delete({ where: { id } });
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al eliminar" };
  }
}

export async function restablecerPassword(_prevState: unknown, formData: FormData) {
  try {
    await verificarSuperAdmin();
    const email = formData.get("email") as string;
    if (!email) return { error: "Email requerido" };

    const adminClient = createAdminClient();
    await adminClient.auth.admin.generateLink({ type: "recovery", email });

    revalidatePath("/admin/usuarios");
    return { success: true, message: "Enlace de restablecimiento enviado" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al enviar enlace" };
  }
}

export async function crearPlan(_prevState: unknown, formData: FormData) {
  try {
    await verificarSuperAdmin();

    const nombre = formData.get("nombre") as string;
    if (!nombre || nombre.length < 2) return { error: "Nombre requerido (mín. 2 caracteres)" };

    await prisma.plan.create({
      data: {
        nombre,
        precioMensual: parseFloat(formData.get("precioMensual") as string) || 0,
        precioAnual: parseFloat(formData.get("precioAnual") as string) || 0,
        limiteFacturas: formData.get("limiteFacturas") ? parseInt(formData.get("limiteFacturas") as string) : null,
        limiteUsuarios: formData.get("limiteUsuarios") ? parseInt(formData.get("limiteUsuarios") as string) : null,
        multiempresa: formData.get("multiempresa") === "on",
        apiAccess: formData.get("apiAccess") === "on",
        reportesAvanzados: formData.get("reportesAvanzados") === "on",
        auditoria: formData.get("auditoria") === "on",
        activo: true,
      },
    });

    revalidatePath("/admin/planes");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al crear plan" };
  }
}

export async function actualizarPlan(_prevState: unknown, formData: FormData) {
  try {
    await verificarSuperAdmin();
    const id = formData.get("id") as string;
    if (!id) return { error: "ID requerido" };

    const data: Record<string, unknown> = {
      nombre: formData.get("nombre") as string,
      precioMensual: parseFloat(formData.get("precioMensual") as string) || 0,
      precioAnual: parseFloat(formData.get("precioAnual") as string) || 0,
    };

    const lf = formData.get("limiteFacturas");
    data.limiteFacturas = lf ? parseInt(lf as string) : null;
    const lu = formData.get("limiteUsuarios");
    data.limiteUsuarios = lu ? parseInt(lu as string) : null;
    data.multiempresa = formData.get("multiempresa") === "on";
    data.apiAccess = formData.get("apiAccess") === "on";
    data.reportesAvanzados = formData.get("reportesAvanzados") === "on";
    data.auditoria = formData.get("auditoria") === "on";

    await prisma.plan.update({ where: { id }, data });

    revalidatePath("/admin/planes");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al actualizar plan" };
  }
}

export async function togglePlanActivo(_prevState: unknown, formData: FormData) {
  try {
    await verificarSuperAdmin();
    const id = formData.get("id") as string;
    if (!id) return { error: "ID requerido" };

    const plan = await prisma.plan.findUnique({ where: { id } });
    if (!plan) return { error: "Plan no encontrado" };

    await prisma.plan.update({ where: { id }, data: { activo: !plan.activo } });

    revalidatePath("/admin/planes");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al cambiar estado" };
  }
}
