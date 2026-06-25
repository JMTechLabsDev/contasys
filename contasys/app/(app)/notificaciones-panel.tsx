"use client";

import { Bell, MailOpen, CheckCheck, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { marcarLeida, marcarTodasLeidas, eliminarNotificacion } from "@/actions/notificacion";
import { useActionState } from "react";

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
  const [, formActionLeer] = useActionState(marcarLeida, null);
  const [, formActionTodas] = useActionState(marcarTodasLeidas, null);
  const [, formActionEliminar] = useActionState(eliminarNotificacion, null);

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
        <div className="flex items-center justify-between pr-2">
          <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
          {noLeidas > 0 && (
            <form action={formActionTodas}>
              <button type="submit" className="text-xs text-primary hover:underline flex items-center gap-1">
                <CheckCheck className="h-3 w-3" /> Marcar todas
              </button>
            </form>
          )}
        </div>
        <DropdownMenuSeparator />
        {notificaciones.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No hay notificaciones
          </div>
        ) : (
          notificaciones.map((n) => (
            <DropdownMenuItem key={n.id} className="p-0">
              <div className="flex items-start gap-2 w-full p-2">
                <Link
                  href={n.url ?? "#"}
                  className="flex items-start gap-2 flex-1 min-w-0"
                  onClick={() => {
                    if (!n.leida) {
                      const fd = new FormData(); fd.set("id", n.id);
                      formActionLeer(fd);
                    }
                  }}
                >
                  <div className="mt-0.5 shrink-0">
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
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(n.creadoEn).toLocaleDateString("es-EC", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </Link>
                <form action={formActionEliminar} className="shrink-0">
                  <input type="hidden" name="id" value={n.id} />
                  <button type="submit" className="p-1 hover:text-destructive transition-colors" title="Eliminar">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </form>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
