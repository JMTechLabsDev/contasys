"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { empresaSchema } from "@/lib/validations/auth";
import { empresaUpdateSchema, configuracionSchema, invitarUsuarioSchema } from "@/lib/validations/empresa";
import { verificarLimiteUsuarios } from "@/lib/plan-limit";

export type EmpresaState = { error?: string } | null;

async function getEmpresaId(): Promise<string> {
  const cookieStore = await cookies();
  const empresaId = cookieStore.get("empresa_activa")?.value;
  if (!empresaId) throw new Error("No hay empresa activa");
  return empresaId;
}

async function registrarAuditoria(params: { empresaId: string; usuarioId: string; accion: string; recurso: string; recursoId?: string; ip?: string; userAgent?: string; datosAnteriores?: unknown; datosNuevos?: unknown }) {
  await prisma.auditoria.create({
    data: {
      empresaId: params.empresaId,
      usuarioId: params.usuarioId,
      accion: params.accion,
      recurso: params.recurso,
      recursoId: params.recursoId,
      ip: params.ip,
      userAgent: params.userAgent,
      datosAnteriores: params.datosAnteriores as any,
      datosNuevos: params.datosNuevos as any,
    },
  });
}

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
    const planDefault = await prisma.plan.findFirst({ where: { activo: true }, orderBy: { precioMensual: "asc" } });
    if (!planDefault) return { error: "No hay planes disponibles" };

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
          ambiente: "pruebas",
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
        planId: planDefault.id,
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

export async function actualizarEmpresa(_prevState: EmpresaState, formData: FormData): Promise<EmpresaState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  let empresaId: string;
  try { empresaId = await getEmpresaId(); } catch { return { error: "No hay empresa activa" }; }

  const parsed = empresaUpdateSchema.safeParse({
    nombre: formData.get("nombre"),
    razonSocial: formData.get("razonSocial"),
    ruc: formData.get("ruc"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    direccion: formData.get("direccion"),
    ciudad: formData.get("ciudad"),
    provincia: formData.get("provincia"),
    regimenTributario: formData.get("regimenTributario"),
    tipoContribuyente: formData.get("tipoContribuyente"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const anterior = await prisma.empresa.findUnique({ where: { id: empresaId } });

  await prisma.empresa.update({
    where: { id: empresaId },
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
      telefono: parsed.data.telefono || null,
      direccion: parsed.data.direccion || null,
      ciudad: parsed.data.ciudad || null,
      provincia: parsed.data.provincia || null,
      regimenTributario: parsed.data.regimenTributario || null,
      tipoContribuyente: parsed.data.tipoContribuyente || null,
    },
  });

  await registrarAuditoria({
    empresaId, usuarioId: user.id,
    accion: "actualizar_empresa", recurso: "empresa", recursoId: empresaId,
    datosAnteriores: { nombre: anterior?.nombre, razonSocial: anterior?.razonSocial },
    datosNuevos: { nombre: parsed.data.nombre, razonSocial: parsed.data.razonSocial },
  });

  revalidatePath("/configuracion/empresa");
  return null;
}

export async function actualizarConfiguracion(_prevState: EmpresaState, formData: FormData): Promise<EmpresaState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  let empresaId: string;
  try { empresaId = await getEmpresaId(); } catch { return { error: "No hay empresa activa" }; }

  let config: Record<string, unknown>;
  try {
    config = JSON.parse(formData.get("configuracion") as string);
  } catch {
    return { error: "Configuración inválida" };
  }

  const parsed = configuracionSchema.safeParse(config);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const anterior = await prisma.empresa.findUnique({ where: { id: empresaId }, select: { configuracion: true } });

  await prisma.empresa.update({
    where: { id: empresaId },
    data: { configuracion: parsed.data },
  });

  await registrarAuditoria({
    empresaId, usuarioId: user.id,
    accion: "actualizar_configuracion", recurso: "empresa", recursoId: empresaId,
    datosAnteriores: anterior?.configuracion,
    datosNuevos: parsed.data,
  });

  revalidatePath("/configuracion/empresa");
  return null;
}

export async function invitarUsuario(_prevState: EmpresaState, formData: FormData): Promise<EmpresaState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  let empresaId: string;
  try { empresaId = await getEmpresaId(); } catch { return { error: "No hay empresa activa" }; }

  const parsed = invitarUsuarioSchema.safeParse({
    email: formData.get("email"),
    rol: formData.get("rol"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const limite = await verificarLimiteUsuarios(empresaId);
  if (!limite.ok) return { error: limite.mensaje };

  const invitado = await prisma.usuario.findUnique({ where: { email: parsed.data.email } });
  if (!invitado) return { error: "No existe un usuario registrado con ese correo electrónico" };

  const existe = await prisma.empresaUsuario.findUnique({
    where: { empresaId_usuarioId: { empresaId, usuarioId: invitado.id } },
  });

  if (existe) {
    if (existe.activo) return { error: "El usuario ya pertenece a esta empresa" };
    await prisma.empresaUsuario.update({
      where: { id: existe.id },
      data: { activo: true, rol: parsed.data.rol },
    });
  } else {
    await prisma.empresaUsuario.create({
      data: { empresaId, usuarioId: invitado.id, rol: parsed.data.rol },
    });
  }

  await registrarAuditoria({
    empresaId, usuarioId: user.id,
    accion: "invitar_usuario", recurso: "empresa_usuario", recursoId: invitado.id,
    datosNuevos: { email: parsed.data.email, rol: parsed.data.rol },
  });

  revalidatePath("/configuracion/usuarios");
  return null;
}

export async function actualizarRolUsuario(_prevState: EmpresaState, formData: FormData): Promise<EmpresaState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  let empresaId: string;
  try { empresaId = await getEmpresaId(); } catch { return { error: "No hay empresa activa" }; }

  const usuarioId = formData.get("usuarioId") as string;
  const rol = formData.get("rol") as string;

  if (!usuarioId || !rol) return { error: "Faltan datos" };

  const eu = await prisma.empresaUsuario.findUnique({
    where: { empresaId_usuarioId: { empresaId, usuarioId } },
  });
  if (!eu) return { error: "El usuario no pertenece a esta empresa" };
  if (eu.rol === "propietario") return { error: "No puedes cambiar el rol del propietario" };

  const anterior = eu.rol;

  await prisma.empresaUsuario.update({
    where: { id: eu.id },
    data: { rol: rol as any },
  });

  await registrarAuditoria({
    empresaId, usuarioId: user.id,
    accion: "cambiar_rol_usuario", recurso: "empresa_usuario", recursoId: usuarioId,
    datosAnteriores: { rol: anterior },
    datosNuevos: { rol },
  });

  revalidatePath("/configuracion/usuarios");
  return null;
}

export async function eliminarUsuarioEmpresa(_prevState: EmpresaState, formData: FormData): Promise<EmpresaState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  let empresaId: string;
  try { empresaId = await getEmpresaId(); } catch { return { error: "No hay empresa activa" }; }

  const usuarioId = formData.get("usuarioId") as string;
  if (!usuarioId) return { error: "Faltan datos" };

  const eu = await prisma.empresaUsuario.findUnique({
    where: { empresaId_usuarioId: { empresaId, usuarioId } },
  });
  if (!eu) return { error: "El usuario no pertenece a esta empresa" };
  if (eu.rol === "propietario") return { error: "No puedes eliminar al propietario de la empresa" };

  await prisma.empresaUsuario.update({
    where: { id: eu.id },
    data: { activo: false },
  });

  await registrarAuditoria({
    empresaId, usuarioId: user.id,
    accion: "eliminar_usuario_empresa", recurso: "empresa_usuario", recursoId: usuarioId,
  });

  revalidatePath("/configuracion/usuarios");
  return null;
}

export async function crearNuevaEmpresa(_prevState: EmpresaState, formData: FormData): Promise<EmpresaState> {
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

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
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
        ambiente: "pruebas",
        estado: "prueba",
      },
    });

    await prisma.empresaUsuario.create({
      data: { empresaId: empresa.id, usuarioId: user.id, rol: "propietario" },
    });

    const planDefault = await prisma.plan.findFirst({ where: { activo: true }, orderBy: { precioMensual: "asc" } });
    if (!planDefault) return { error: "No hay planes disponibles" };

    await prisma.suscripcion.create({
      data: {
        empresaId: empresa.id,
        planId: planDefault.id,
        estado: "trial",
        periodo: "mensual",
        fechaFin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("empresa_activa", empresa.id, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return { error: "El RUC ya está registrado por otra empresa" };
    }
    return { error: "Error al crear la empresa" };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}



