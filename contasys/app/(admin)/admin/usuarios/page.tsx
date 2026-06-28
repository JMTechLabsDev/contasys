import { prisma } from "@/lib/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UsuariosTable } from "./usuarios-table";

export default async function AdminUsuariosPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search } = await searchParams;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const usuarios = await prisma.usuario.findMany({
    where: where as any,
    orderBy: { creadoEn: "desc" },
    select: { id: true, nombre: true, email: true, rolPlataforma: true, creadoEn: true },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">{usuarios.length} usuarios registrados</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <UsuariosTable usuarios={usuarios} search={search} />
        </CardContent>
      </Card>
    </div>
  );
}
