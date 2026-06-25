import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { cookies } from "next/headers";
import { AuditoriaClient } from "./auditoria-client";

export default async function AuditoriaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <p className="p-6 text-muted-foreground">No autenticado</p>;

  const cookieStore = await cookies();
  const empresaId = cookieStore.get("empresa_activa")?.value;
  if (!empresaId) return <p className="p-6 text-muted-foreground">No hay empresa activa</p>;

  const registros = await prisma.auditoria.findMany({
    where: { empresaId },
    include: { usuario: { select: { nombre: true, email: true } } },
    orderBy: { creadoEn: "desc" },
    take: 100,
  });

  return <AuditoriaClient registros={registros as any} />;
}
