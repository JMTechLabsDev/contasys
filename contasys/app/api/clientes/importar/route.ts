import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { clienteSchema } from "@/lib/validations/cliente";

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

    const { clientes } = await req.json();
    if (!Array.isArray(clientes) || clientes.length === 0) {
      return NextResponse.json({ error: "No hay clientes para importar" }, { status: 400 });
    }

    let imported = 0;
    const errors: string[] = [];

    for (const raw of clientes) {
      const etiquetasRaw = raw.etiquetas || "";
      const etiquetas = etiquetasRaw
        .split(",")
        .map((e: string) => e.trim())
        .filter(Boolean);

      const parsed = clienteSchema.safeParse({
        tipoIdentificacion: raw.tipo_identificacion || raw.tipoidentificacion || "cedula",
        identificacion: raw.identificacion,
        nombre: raw.nombre,
        razonSocial: raw.razon_social || raw.razonsocial || "",
        email: raw.email || "",
        telefono: raw.telefono || "",
        direccion: raw.direccion || "",
        ciudad: raw.ciudad || "",
        provincia: raw.provincia || "",
        etiquetas,
      });

      if (!parsed.success) {
        errors.push(`Fila "${raw.nombre}": ${parsed.error.issues[0].message}`);
        continue;
      }

      const exists = await prisma.cliente.findFirst({
        where: { empresaId: eu.empresaId, identificacion: parsed.data.identificacion, activo: true },
      });
      if (exists) {
        errors.push(`"${raw.nombre}": identificación duplicada, se omitió`);
        continue;
      }

      await prisma.cliente.create({
        data: {
          empresaId: eu.empresaId,
          ...parsed.data,
          razonSocial: parsed.data.razonSocial || null,
          email: parsed.data.email || null,
          telefono: parsed.data.telefono || null,
          direccion: parsed.data.direccion || null,
          ciudad: parsed.data.ciudad || null,
          provincia: parsed.data.provincia || null,
        },
      });
      imported++;
    }

    return NextResponse.json({
      count: imported,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}