"use client";

import { Building2, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type EmpresaItem = {
  id: string;
  nombre: string;
  activa: boolean;
  rol: string;
};

export function EmpresaSelector({
  empresaNombre,
  empresas,
}: {
  empresaNombre: string;
  empresas: EmpresaItem[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors outline-none">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="truncate max-w-32">{empresaNombre}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {empresas.map((emp) => (
          <DropdownMenuItem key={emp.id}>
            <form action="/api/empresa/cambiar" method="POST" className="flex w-full">
              <input type="hidden" name="empresaId" value={emp.id} />
              <button type="submit" className="flex w-full items-center gap-2 cursor-pointer">
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{emp.nombre}</p>
                  <p className="text-xs text-muted-foreground capitalize">{emp.rol}</p>
                </div>
                {emp.activa && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            </form>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
