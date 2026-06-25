import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { cookies } from "next/headers";
import { EmpresaConfigClient } from "./empresa-config-client";

export default async function ConfiguracionEmpresaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <p className="p-6 text-muted-foreground">No autenticado</p>;

  const cookieStore = await cookies();
  const empresaId = cookieStore.get("empresa_activa")?.value;
  if (!empresaId) return <p className="p-6 text-muted-foreground">No hay empresa activa</p>;

  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
  if (!empresa) return <p className="p-6 text-muted-foreground">Empresa no encontrada</p>;

  const config = empresa.configuracion as Record<string, unknown> | null;

  return <EmpresaConfigClient empresa={empresa} config={config} />;
}
