"use client";

import { Bell, MailOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

type NotificacionItem = {
  id: string;
  titulo: string;
  mensaje: string | null;
  leida: boolean;
  url: string | null;
  creadoEn: string;
};

export function NotificacionesPanel({
  notificaciones,
  noLeidas,
}: {
  notificaciones: NotificacionItem[];
  noLeidas: number;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors relative">
        <Bell className="h-4 w-4" />
        {noLeidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {noLeidas}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notificaciones.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No hay notificaciones
          </div>
        ) : (
          notificaciones.map((n) => (
            <DropdownMenuItem key={n.id}>
              {n.url ? (
                <Link href={n.url} className="flex items-start gap-2 w-full">
                  <div className="mt-0.5">
                    {n.leida ? (
                      <MailOpen className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Bell className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${n.leida ? "" : "font-medium"}`}>
                      {n.titulo}
                    </p>
                    {n.mensaje && (
                      <p className="text-xs text-muted-foreground truncate">{n.mensaje}</p>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="flex items-start gap-2 w-full">
                  <div className="mt-0.5">
                    {n.leida ? (
                      <MailOpen className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Bell className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${n.leida ? "" : "font-medium"}`}>
                      {n.titulo}
                    </p>
                    {n.mensaje && (
                      <p className="text-xs text-muted-foreground truncate">{n.mensaje}</p>
                    )}
                  </div>
                </div>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
