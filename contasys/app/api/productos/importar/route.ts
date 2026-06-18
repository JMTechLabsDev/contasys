import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { productoSchema } from "@/lib/validations/producto";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const cookieStore = await cookies();
    const empresaActivaId = cookieStore.get("empresa_activa")?.value;

    const eu = await prisma.empresaUsuario.findFirst({
      where: { usuarioId: user.id, activo: true, ...(empresaActivaId ? { empresaId: empresaActivaId } : {}) },
    });
    if (!eu) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { productos } = await req.json();
    if (!Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json({ error: "No hay productos para importar" }, { status: 400 });
    }

    let imported = 0;
    const errors: string[] = [];

    for (const raw of productos) {
      const parsed = productoSchema.safeParse({
        nombre: raw.nombre,
        sku: raw.sku || "",
        descripcion: raw.descripcion || "",
        categoria: raw.categoria || "",
        precio: raw.precio,
        costo: raw.costo || "",
        impuesto: raw.impuesto || "15%",
        stock: raw.stock ?? "",
      });

      if (!parsed.success) {
        errors.push(`"${raw.nombre}": ${parsed.error.issues[0].message}`);
        continue;
      }

      await prisma.producto.create({
        data: {
          empresaId: eu.empresaId,
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
      imported++;
    }

    return NextResponse.json({ count: imported, errors: errors.length > 0 ? errors : undefined });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
