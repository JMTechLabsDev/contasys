import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { SuscripcionContent } from "./suscripcion-content";

export default async function SuscripcionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <p className="p-6 text-muted-foreground">No autenticado</p>;

  const cookieStore = await cookies();
  const empresaId = cookieStore.get("empresa_activa")?.value;
  if (!empresaId) return <p className="p-6 text-muted-foreground">No hay empresa activa</p>;

  const suscripcion = await prisma.suscripcion.findFirst({
    where: { empresaId },
    orderBy: { creadoEn: "desc" },
    include: { plan: true, planPendiente: true, pagos: { orderBy: { creadoEn: "desc" }, take: 10 } },
  });

  const planes = await prisma.plan.findMany({ where: { activo: true }, orderBy: { precioMensual: "asc" } });
  const facturasMes = await prisma.factura.count({
    where: { empresaId, creadoEn: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
  });
  const usuariosActivos = await prisma.empresaUsuario.count({ where: { empresaId, activo: true } });

  return (
    <SuscripcionContent
      suscripcion={suscripcion as any}
      planes={planes as any}
      facturasMes={facturasMes}
      usuariosActivos={usuariosActivos}
      appUrl={process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}
    />
  );
}
