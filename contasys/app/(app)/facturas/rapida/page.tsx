import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { FacturaRapidaForm } from "./factura-rapida-form";

export default async function FacturaRapidaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get("empresa_activa")?.value;

  const eu = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true, ...(empresaActivaId ? { empresaId: empresaActivaId } : {}) },
  });
  if (!eu) redirect("/onboarding");

  const [clientes, productos] = await Promise.all([
    prisma.cliente.findMany({
      where: { empresaId: eu.empresaId, activo: true },
      select: { id: true, nombre: true, identificacion: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.producto.findMany({
      where: { empresaId: eu.empresaId, activo: true },
      select: { id: true, nombre: true, precio: true },
      take: 10,
      orderBy: { nombre: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Facturación Rápida</h1>
        <p className="text-muted-foreground">Crea una factura en segundos con un solo item</p>
      </div>
      <FacturaRapidaForm
        clientes={clientes}
        productos={productos.map((p) => ({ ...p, precio: Number(p.precio) }))}
      />
    </div>
  );
}
