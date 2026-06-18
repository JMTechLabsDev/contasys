import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { FacturaForm } from "../factura-form";

export default async function NuevaFacturaPage() {
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
      select: { id: true, nombre: true, precio: true, impuesto: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nueva Factura</h1>
        <p className="text-muted-foreground">Crea una nueva factura para un cliente</p>
      </div>
      <FacturaForm
        clientes={clientes}
        productos={productos.map((p) => ({ ...p, precio: Number(p.precio) }))}
      />
    </div>
  );
}
