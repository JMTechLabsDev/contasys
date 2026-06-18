"use client";

import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { EmpresaSelector } from "./empresa-selector";
import { NotificacionesPanel } from "./notificaciones-panel";

const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  facturas: "Facturas",
  clientes: "Clientes",
  productos: "Productos",
  "cuentas-cobrar": "Cuentas por Cobrar",
  reportes: "Reportes",
  suscripcion: "Suscripción",
  configuracion: "Configuración",
};

type EmpresaItem = {
  id: string;
  nombre: string;
  activa: boolean;
  rol: string;
};

type NotificacionItem = {
  id: string;
  titulo: string;
  mensaje: string | null;
  leida: boolean;
  url: string | null;
  creadoEn: string;
};

export function AppTopbar({
  empresaNombre,
  empresaId,
  empresas,
  notificacionesNoLeidas,
  notificaciones,
}: {
  empresaNombre: string;
  empresaId: string;
  empresas: EmpresaItem[];
  notificacionesNoLeidas: number;
  notificaciones: NotificacionItem[];
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <EmpresaSelector empresaNombre={empresaNombre} empresas={empresas} />
        <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          {segments.map((seg, i) => {
            const label = breadcrumbLabels[seg] || seg;
            return (
              <span key={seg} className="flex items-center gap-2">
                {i > 0 && <span>/</span>}
                <span className={i === segments.length - 1 ? "font-medium text-foreground" : ""}>
                  {label}
                </span>
              </span>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificacionesPanel notificaciones={notificaciones} noLeidas={notificacionesNoLeidas} />
        <form action="/api/auth/logout" method="POST">
          <Button type="submit" variant="ghost" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Cerrar Sesión</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
