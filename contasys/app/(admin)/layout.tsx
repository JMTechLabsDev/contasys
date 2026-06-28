import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const usuario = await prisma.usuario.findUnique({ where: { id: user.id }, select: { rolPlataforma: true } });
  if (!usuario || usuario.rolPlataforma !== "superadmin") redirect("/dashboard");

  const [totalUsuarios, totalEmpresas, empresasSuspendidas, suscripcionesActivas, planesActivos] = await Promise.all([
    prisma.usuario.count(),
    prisma.empresa.count(),
    prisma.empresa.count({ where: { estado: "suspendida" } }),
    prisma.suscripcion.count({ where: { estado: "activa" } }),
    prisma.plan.count({ where: { activo: true } }),
  ]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar counts={{ totalUsuarios, totalEmpresas, empresasSuspendidas, suscripcionesActivas, planesActivos }} />
      <main className="flex-1 bg-muted/30">{children}</main>
    </div>
  );
}
