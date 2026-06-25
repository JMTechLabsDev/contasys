import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { cookies } from "next/headers";
import { UsuariosConfigClient } from "./usuarios-config-client";

export default async function ConfiguracionUsuariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <p className="p-6 text-muted-foreground">No autenticado</p>;

  const cookieStore = await cookies();
  const empresaId = cookieStore.get("empresa_activa")?.value;
  if (!empresaId) return <p className="p-6 text-muted-foreground">No hay empresa activa</p>;

  const miembros = await prisma.empresaUsuario.findMany({
    where: { empresaId },
    include: { usuario: { select: { id: true, nombre: true, email: true, avatarUrl: true } } },
    orderBy: { invitadoEn: "desc" },
  });

  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId }, select: { nombre: true } });

  return <UsuariosConfigClient miembros={miembros as any} empresaNombre={empresa?.nombre ?? ""} usuarioActualId={user.id} />;
}
