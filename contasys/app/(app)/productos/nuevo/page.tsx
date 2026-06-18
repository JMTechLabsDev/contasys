import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { ProductoForm } from "../producto-form";

export default async function NuevoProductoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get("empresa_activa")?.value;

  const eu = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true, ...(empresaActivaId ? { empresaId: empresaActivaId } : {}) },
  });
  if (!eu) redirect("/onboarding");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Producto</h1>
        <p className="text-muted-foreground">Agrega un producto o servicio a tu catálogo.</p>
      </div>
      <ProductoForm />
    </div>
  );
}
