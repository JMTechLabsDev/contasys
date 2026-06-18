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

  const clientes = await prisma.cliente.findMany({
    where: { empresaId: eu.empresaId, activo: true },
    orderBy: { nombre: "asc" },
  });

  const header = "Identificacion,Nombre,RazonSocial,Email,Telefono,Direccion,Ciudad,Provincia";
  const rows = clientes.map((c) =>
    [
      c.identificacion,
      `"${c.nombre}"`,
      c.razonSocial ? `"${c.razonSocial}"` : "",
      c.email || "",
      c.telefono || "",
      c.direccion ? `"${c.direccion}"` : "",
      c.ciudad || "",
      c.provincia || "",
    ].join(","),
  );

  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="clientes_${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
