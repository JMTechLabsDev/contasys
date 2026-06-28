"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Building2, CreditCard, BarChart3, LifeBuoy, Menu, X, Shield, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface AdminCounts {
  totalUsuarios: number;
  totalEmpresas: number;
  empresasSuspendidas: number;
  suscripcionesActivas: number;
  planesActivos: number;
}

const adminLinks: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badgeKey?: keyof AdminCounts; badgeColor?: string }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users, badgeKey: "totalUsuarios" },
  { href: "/admin/empresas", label: "Empresas", icon: Building2, badgeKey: "totalEmpresas" },
  { href: "/admin/planes", label: "Planes", icon: CreditCard, badgeKey: "planesActivos" },
  { href: "/admin/finanzas", label: "Finanzas", icon: BarChart3, badgeKey: "suscripcionesActivas" },
  { href: "/admin/soporte", label: "Soporte", icon: LifeBuoy },
];

export function AdminSidebar({ counts }: { counts: AdminCounts }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="fixed left-4 top-3 z-50 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle sidebar">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <Shield className="h-5 w-5 text-primary" />
          <Link href="/admin/dashboard" className="text-lg font-bold">ContaSys Admin</Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {adminLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const badgeCount = link.badgeKey ? counts[link.badgeKey] : undefined;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{link.label}</span>
                {badgeCount !== undefined && (
                  <Badge variant="secondary" className="text-xs ml-auto">{badgeCount}</Badge>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3 text-xs text-muted-foreground space-y-2">
          {counts.empresasSuspendidas > 0 && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-3 w-3" />
              <span>{counts.empresasSuspendidas} empresa{counts.empresasSuspendidas !== 1 ? "s" : ""} suspendida{counts.empresasSuspendidas !== 1 ? "s" : ""}</span>
            </div>
          )}
          <Link href="/dashboard" className="block hover:text-primary transition-colors">← Volver a la app</Link>
          <p>ContaSys Admin v1.0</p>
        </div>
      </aside>
    </>
  );
}
