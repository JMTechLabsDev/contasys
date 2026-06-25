import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { ApiKeysClient } from "./api-keys-client";

export default async function ApiKeysPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get("empresa_activa")?.value;

  const eu = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true, ...(empresaActivaId ? { empresaId: empresaActivaId } : {}) },
  });
  if (!eu) redirect("/onboarding");

  const keys = await prisma.apiKey.findMany({
    where: { empresaId: eu.empresaId },
    select: { id: true, nombre: true, permisos: true, ultimoUso: true, activa: true, creadoEn: true },
    orderBy: { creadoEn: "desc" },
  });

  return <ApiKeysClient keys={keys} />;
}
