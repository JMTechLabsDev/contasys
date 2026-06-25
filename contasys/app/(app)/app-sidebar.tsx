"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  CreditCard,
  BarChart3,
  Settings,
  CreditCard as SubIcon,
  Menu,
  X,
  Repeat,
  Percent,
  Truck,
} from "lucide-react";
import { useState } from "react";

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/facturas", label: "Facturas", icon: FileText },
  { href: "/facturas/recurrentes", label: "Recurrentes", icon: Repeat },
  { href: "/facturas/retenciones", label: "Retenciones", icon: Percent },
  { href: "/facturas/guias", label: "Guías Rem.", icon: Truck },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/cuentas-cobrar", label: "C x Cobrar", icon: CreditCard },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/suscripcion", label: "Suscripción", icon: SubIcon },
];

const configLinks = [
  { href: "/configuracion/empresa", label: "Empresa", icon: Settings },
  { href: "/configuracion/usuarios", label: "Usuarios", icon: Users },
  { href: "/configuracion/sri", label: "SRI", icon: FileText },
  { href: "/configuracion/auditoria", label: "Auditoría", icon: BarChart3 },
  { href: "/empresa/nueva", label: "+ Nueva Empresa", icon: CreditCard },
];

export function AppSidebar({
  empresaNombre,
}: {
  empresaNombre: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fixed left-4 top-3 z-50 md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <Link href="/dashboard" className="text-lg font-bold">
            ContaSys
          </Link>
          <span className="truncate text-xs text-muted-foreground">
            {empresaNombre}
          </span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {mainLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">Configuración</p>
          </div>
          {configLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3 text-xs text-muted-foreground">
          ContaSys v1.0
        </div>
      </aside>
    </>
  );
}
