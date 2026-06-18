import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("No autorizado", { status: 401 });

  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get("empresa_activa")?.value;

  const eu = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true, ...(empresaActivaId ? { empresaId: empresaActivaId } : {}) },
  });
  if (!eu) return new Response("No autorizado", { status: 401 });

  const productos = await prisma.producto.findMany({
    where: { empresaId: eu.empresaId, activo: true },
    orderBy: { nombre: "asc" },
  });

  const header = "Nombre,SKU,Descripcion,Categoria,Precio,Costo,Impuesto,Stock";
  const rows = productos.map((p) =>
    [
      `"${p.nombre}"`,
      p.sku || "",
      p.descripcion ? `"${p.descripcion}"` : "",
      p.categoria || "",
      Number(p.precio).toString(),
      p.costo ? Number(p.costo).toString() : "",
      p.impuesto,
      p.stock?.toString() || "",
    ].join(","),
  );

  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="productos_${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
