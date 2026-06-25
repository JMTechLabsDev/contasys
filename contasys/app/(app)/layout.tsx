import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const empresasUsuario = await prisma.empresaUsuario.findMany({
    where: { usuarioId: user.id, activo: true },
    include: { empresa: true },
  });

  if (empresasUsuario.length === 0) redirect("/onboarding");

  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get("empresa_activa")?.value;

  const activa = empresaActivaId
    ? empresasUsuario.find((eu) => eu.empresaId === empresaActivaId)
    : null;
  const empresaUsuario = activa ?? empresasUsuario[0];

  const suscripcion = await prisma.suscripcion.findFirst({
    where: { empresaId: empresaUsuario.empresaId },
    orderBy: { creadoEn: "desc" },
    include: { plan: { select: { nombre: true } } },
  });

  const notificacionesNoLeidas = await prisma.notificacion.count({
    where: { usuarioId: user.id, leida: false },
  });

  const notificaciones = await prisma.notificacion.findMany({
    where: { usuarioId: user.id },
    orderBy: { creadoEn: "desc" },
    take: 5,
  });

  return (
    <div className="flex min-h-screen">
      <AppSidebar empresaNombre={empresaUsuario.empresa.nombre} planNombre={suscripcion?.plan?.nombre ?? null} planEstado={suscripcion?.estado ?? "trial"} />
      <div className="flex flex-1 flex-col">
        <AppTopbar
          empresaNombre={empresaUsuario.empresa.nombre}
          empresaId={empresaUsuario.empresaId}
          empresas={empresasUsuario.map((eu) => ({
            id: eu.empresaId,
            nombre: eu.empresa.nombre,
            activa: eu.empresaId === empresaUsuario.empresaId,
            rol: eu.rol,
          }))}
          notificacionesNoLeidas={notificacionesNoLeidas}
          notificaciones={notificaciones.map((n) => ({
            id: n.id,
            titulo: n.titulo,
            mensaje: n.mensaje,
            leida: n.leida,
            url: n.url,
            creadoEn: n.creadoEn.toISOString(),
          }))}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
