import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { Plus } from "lucide-react";
import Link from "next/link";
import { FacturasTable } from "./facturas-table";

const estados = [
  { value: "", label: "Todos los estados" },
  { value: "borrador", label: "Borrador" },
  { value: "pendiente", label: "Pendiente" },
  { value: "procesando", label: "Procesando" },
  { value: "autorizado", label: "Autorizado" },
  { value: "rechazado", label: "Rechazado" },
  { value: "anulado", label: "Anulado" },
];

export default async function FacturasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; page?: string; tipo?: string }>;
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
  const estado = sp.estado?.trim() || "";
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const limit = 10;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    empresaId: eu.empresaId,
    tipoComprobante: { in: ["factura", "nota_credito", "nota_debito"] },
  };
  if (estado) where.estado = estado;

  const [facturas, total] = await Promise.all([
    prisma.factura.findMany({
      where,
      include: { cliente: { select: { nombre: true } } },
      orderBy: { fechaEmision: "desc" },
      take: limit,
      skip,
    }),
    prisma.factura.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facturas</h1>
          <p className="text-muted-foreground">{total} factura{total !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/facturas/nueva"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Factura
        </Link>
      </div>

      <form className="flex gap-3">
        <select
          name="estado"
          defaultValue={estado}
          onChange={(e) => e.target.form?.submit()}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          {estados.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </form>

      <FacturasTable facturas={facturas} estado={estado} page={page} totalPages={totalPages} />
    </div>
  );
}
