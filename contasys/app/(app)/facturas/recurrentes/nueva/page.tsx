import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { RecurrenteForm } from "./recurrente-form";

export default async function NuevaRecurrenciaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get("empresa_activa")?.value;

  const eu = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true, ...(empresaActivaId ? { empresaId: empresaActivaId } : {}) },
  });
  if (!eu) redirect("/onboarding");

  const [clientes, rawProductos] = await Promise.all([
    prisma.cliente.findMany({ where: { empresaId: eu.empresaId, activo: true }, orderBy: { nombre: "asc" } }),
    prisma.producto.findMany({ where: { empresaId: eu.empresaId, activo: true }, orderBy: { nombre: "asc" } }),
  ]);

  const productos = rawProductos.map((p) => ({ id: p.id, nombre: p.nombre, precio: Number(p.precio) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nueva Facturación Recurrente</h1>
        <p className="text-muted-foreground">Configura una recurrencia para generar facturas automáticamente</p>
      </div>
      <RecurrenteForm clientes={clientes} productos={productos} />
    </div>
  );
}
