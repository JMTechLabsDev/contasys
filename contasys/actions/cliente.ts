"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { clienteSchema } from "@/lib/validations/cliente";
import { registrarAuditoria } from "@/lib/audit";

export type ClienteState = {
  error?: string;
};

async function getEmpresaId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get("empresa_activa")?.value;

  const eu = await prisma.empresaUsuario.findFirst({
    where: {
      usuarioId: user.id,
      activo: true,
      ...(empresaActivaId ? { empresaId: empresaActivaId } : {}),
    },
  });

  return eu?.empresaId ?? null;
}

function parseEtiquetas(formData: FormData): string[] {
  try {
    const raw = formData.get("etiquetas");
    if (!raw || typeof raw !== "string") return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((e): e is string => typeof e === "string") : [];
  } catch {
    return [];
  }
}

export async function crearCliente(
  _prevState: ClienteState | null,
  formData: FormData,
): Promise<ClienteState> {
  const etiquetas = parseEtiquetas(formData);
  const parsed = clienteSchema.safeParse({
    tipoIdentificacion: formData.get("tipoIdentificacion"),
    identificacion: formData.get("identificacion"),
    nombre: formData.get("nombre"),
    razonSocial: formData.get("razonSocial"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    direccion: formData.get("direccion"),
    ciudad: formData.get("ciudad"),
    provincia: formData.get("provincia"),
    etiquetas,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };
  const userId = (await (await createClient()).auth.getUser()).data.user?.id;
  if (!userId) return { error: "No autorizado" };

  const exists = await prisma.cliente.findFirst({
    where: { empresaId, identificacion: parsed.data.identificacion, activo: true },
  });
  if (exists) {
    return { error: "Ya existe un cliente activo con esta identificación" };
  }

  const cliente = await prisma.cliente.create({
    data: {
      empresaId,
      ...parsed.data,
    },
  });

  await registrarAuditoria({ empresaId, usuarioId: userId, accion: "crear", recurso: "cliente", recursoId: cliente.id, datosNuevos: parsed.data as any });

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function editarCliente(
  _prevState: ClienteState | null,
  formData: FormData,
): Promise<ClienteState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "ID de cliente requerido" };

  const etiquetas = parseEtiquetas(formData);
  const parsed = clienteSchema.safeParse({
    tipoIdentificacion: formData.get("tipoIdentificacion"),
    identificacion: formData.get("identificacion"),
    nombre: formData.get("nombre"),
    razonSocial: formData.get("razonSocial"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    direccion: formData.get("direccion"),
    ciudad: formData.get("ciudad"),
    provincia: formData.get("provincia"),
    etiquetas,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };
  const userId = (await (await createClient()).auth.getUser()).data.user?.id;

  const cliente = await prisma.cliente.findFirst({
    where: { id, empresaId },
  });
  if (!cliente) return { error: "Cliente no encontrado" };

  const duplicado = await prisma.cliente.findFirst({
    where: {
      empresaId,
      identificacion: parsed.data.identificacion,
      id: { not: id },
      activo: true,
    },
  });
  if (duplicado) {
    return { error: "Otro cliente activo ya usa esta identificación" };
  }

  const datosNuevos = {
    ...parsed.data,
    razonSocial: parsed.data.razonSocial || null,
    email: parsed.data.email || null,
    telefono: parsed.data.telefono || null,
    direccion: parsed.data.direccion || null,
    ciudad: parsed.data.ciudad || null,
    provincia: parsed.data.provincia || null,
  };

  await prisma.cliente.update({ where: { id }, data: datosNuevos });

  if (userId) {
    const datosAnteriores = { tipoIdentificacion: cliente.tipoIdentificacion, identificacion: cliente.identificacion, nombre: cliente.nombre, email: cliente.email };
    await registrarAuditoria({ empresaId, usuarioId: userId, accion: "editar", recurso: "cliente", recursoId: id, datosAnteriores: datosAnteriores as any, datosNuevos: datosNuevos as any });
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function eliminarCliente(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const empresaId = await getEmpresaId();
  if (!empresaId) return;

  const userId = (await (await createClient()).auth.getUser()).data.user?.id;
  await prisma.cliente.updateMany({ where: { id, empresaId }, data: { activo: false } });

  if (userId) {
    await registrarAuditoria({ empresaId, usuarioId: userId, accion: "eliminar", recurso: "cliente", recursoId: id });
  }

  revalidatePath("/clientes");
}
