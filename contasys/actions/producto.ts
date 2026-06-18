"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { productoSchema } from "@/lib/validations/producto";

export type ProductoState = { error?: string };

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

export async function crearProducto(
  _prevState: ProductoState | null,
  formData: FormData,
): Promise<ProductoState> {
  const parsed = productoSchema.safeParse({
    nombre: formData.get("nombre"),
    sku: formData.get("sku"),
    descripcion: formData.get("descripcion"),
    categoria: formData.get("categoria"),
    precio: formData.get("precio"),
    costo: formData.get("costo"),
    impuesto: formData.get("impuesto"),
    stock: formData.get("stock"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  await prisma.producto.create({
    data: {
      empresaId,
      nombre: parsed.data.nombre,
      sku: parsed.data.sku || null,
      descripcion: parsed.data.descripcion || null,
      categoria: parsed.data.categoria || null,
      precio: parsed.data.precio,
      costo: parsed.data.costo ? Number(parsed.data.costo) : null,
      impuesto: parsed.data.impuesto,
      stock: parsed.data.stock ? Number(parsed.data.stock) : null,
    },
  });

  revalidatePath("/productos");
  redirect("/productos");
}

export async function editarProducto(
  _prevState: ProductoState | null,
  formData: FormData,
): Promise<ProductoState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "ID de producto requerido" };

  const parsed = productoSchema.safeParse({
    nombre: formData.get("nombre"),
    sku: formData.get("sku"),
    descripcion: formData.get("descripcion"),
    categoria: formData.get("categoria"),
    precio: formData.get("precio"),
    costo: formData.get("costo"),
    impuesto: formData.get("impuesto"),
    stock: formData.get("stock"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const producto = await prisma.producto.findFirst({ where: { id, empresaId } });
  if (!producto) return { error: "Producto no encontrado" };

  await prisma.producto.update({
    where: { id },
    data: {
      nombre: parsed.data.nombre,
      sku: parsed.data.sku || null,
      descripcion: parsed.data.descripcion || null,
      categoria: parsed.data.categoria || null,
      precio: parsed.data.precio,
      costo: parsed.data.costo ? Number(parsed.data.costo) : null,
      impuesto: parsed.data.impuesto,
      stock: parsed.data.stock ? Number(parsed.data.stock) : null,
    },
  });

  revalidatePath("/productos");
  redirect("/productos");
}

export async function eliminarProducto(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const empresaId = await getEmpresaId();
  if (!empresaId) return;

  await prisma.producto.updateMany({
    where: { id, empresaId },
    data: { activo: false },
  });

  revalidatePath("/productos");
  redirect("/productos");
}
