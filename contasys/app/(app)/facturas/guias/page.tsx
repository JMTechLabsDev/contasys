import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { GuiasTable } from "./guias-table";

export default async function GuiasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get("empresa_activa")?.value;

  const eu = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true, ...(empresaActivaId ? { empresaId: empresaActivaId } : {}) },
  });
  if (!eu) redirect("/onboarding");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const limit = 10;
  const skip = (page - 1) * limit;

  const where = { empresaId: eu.empresaId, tipoComprobante: "guia_remision" };

  const [guias, total] = await Promise.all([
    prisma.factura.findMany({
      where: where as any,
      include: { cliente: { select: { nombre: true } } },
      orderBy: { fechaEmision: "desc" },
      take: limit,
      skip,
    }),
    prisma.factura.count({ where: where as any }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Guías de Remisión</h1>
          <p className="text-muted-foreground">{total} guía{total !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/facturas/guias/nueva"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Guía
        </Link>
      </div>

      <GuiasTable guias={guias} page={page} totalPages={totalPages} />
    </div>
  );
}
