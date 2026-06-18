import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";

export default async function SriConfigPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get("empresa_activa")?.value;

  const eu = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true, ...(empresaActivaId ? { empresaId: empresaActivaId } : {}) },
  });
  if (!eu) redirect("/onboarding");

  const empresa = await prisma.empresa.findUnique({ where: { id: eu.empresaId } });
  if (!empresa) redirect("/onboarding");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración SRI</h1>
        <p className="text-muted-foreground">Datos fiscales para facturación electrónica</p>
      </div>

      <div className="rounded-lg border p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground block">RUC</span>
            <span className="font-medium">{empresa.ruc}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground block">Ambiente SRI</span>
            <span className="inline-block rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 px-2 py-0.5 text-xs font-medium">Producción</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground block">Razón Social</span>
            <span className="font-medium">{empresa.razonSocial}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground block">Nombre Comercial</span>
            <span className="font-medium">{empresa.nombre}</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground block">Dirección Matriz</span>
            <span>{empresa.direccion || "—"}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground block">Ciudad</span>
            <span>{empresa.ciudad || "—"}</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground block">Provincia</span>
            <span>{empresa.provincia || "—"}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground block">Teléfono</span>
            <span>{empresa.telefono || "—"}</span>
          </div>
        </div>
        <div>
          <span className="text-sm text-muted-foreground block">Email</span>
          <span>{empresa.email || "—"}</span>
        </div>
      </div>

      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Certificado Digital (.p12)</p>
        <p className="mt-1">Próximamente: carga de certificado digital emitido por una entidad certificadora autorizada por el SRI.</p>
      </div>
    </div>
  );
}
