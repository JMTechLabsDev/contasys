import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { Plus, Search, Download, Upload } from "lucide-react";
import Link from "next/link";
import { ProductosTable } from "./productos-table";
import { CATEGORIAS } from "@/lib/validations/producto";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; page?: string }>;
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
  const query = sp.q?.trim() || "";
  const categoria = sp.categoria?.trim() || "";
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const limit = 10;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { empresaId: eu.empresaId, activo: true };

  if (query) {
    where.OR = [
      { nombre: { contains: query, mode: "insensitive" as const } },
      { sku: { contains: query, mode: "insensitive" as const } },
      { descripcion: { contains: query, mode: "insensitive" as const } },
    ];
  }

  if (categoria) {
    where.categoria = categoria;
  }

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({ where, orderBy: { nombre: "asc" }, take: limit, skip }),
    prisma.producto.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos y Servicios</h1>
          <p className="text-muted-foreground">{total} producto{total !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/productos/importar" className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
            <Upload className="h-4 w-4" />
            Importar
          </Link>
          <Link href="/api/productos/exportar" className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </Link>
          <Link href="/productos/nuevo" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Link>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form>
            <input
              name="q"
              defaultValue={query}
              placeholder="Buscar por nombre, SKU o descripción..."
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </form>
        </div>
        <form>
          {query && <input type="hidden" name="q" value={query} />}
          <select
            name="categoria"
            defaultValue={categoria}
            onChange={(e) => e.target.form?.submit()}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </form>
      </div>

      <ProductosTable productos={productos} query={query} categoria={categoria} page={page} totalPages={totalPages} />
    </div>
  );
}
