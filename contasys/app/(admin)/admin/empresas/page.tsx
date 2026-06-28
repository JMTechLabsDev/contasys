import { prisma } from "@/lib/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

const estadoColors: Record<string, string> = { activa: "bg-green-600", suspendida: "bg-red-600", prueba: "bg-amber-600" };

export default async function AdminEmpresasPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search } = await searchParams;

  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ nombre: { contains: search, mode: "insensitive" } }, { ruc: { contains: search } }];

  const empresas = await prisma.empresa.findMany({
    where: where as any,
    orderBy: { creadoEn: "desc" },
    select: {
      id: true, nombre: true, ruc: true, email: true, estado: true, ambiente: true, creadoEn: true,
      suscripciones: { where: { OR: [{ estado: "activa" }, { estado: "trial" }, { estado: "pendiente_cambio" }] }, take: 1, select: { estado: true, plan: { select: { nombre: true } } } },
      _count: { select: { empresaUsuarios: true, facturas: true } },
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Empresas</h1>
        <p className="text-muted-foreground">{empresas.length} empresas registradas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empresas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex gap-2 max-w-sm" method="GET">
            <Input name="search" placeholder="Buscar por nombre o RUC..." defaultValue={search || ""} />
            <Button type="submit" variant="outline" size="sm"><Search className="h-4 w-4" /></Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>RUC</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Facturas</TableHead>
                <TableHead>Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresas.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Ninguna empresa encontrada</TableCell></TableRow>
              ) : (
                empresas.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.nombre}</TableCell>
                    <TableCell className="text-sm">{e.ruc}</TableCell>
                    <TableCell>
                      <Badge className={`${estadoColors[e.estado] || "bg-gray-600"} text-white text-xs`}>{e.estado}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{e.suscripciones[0]?.plan?.nombre || "Sin plan"} <span className="text-xs text-muted-foreground">({e.suscripciones[0]?.estado || "—"})</span></TableCell>
                    <TableCell className="text-sm">{e._count.empresaUsuarios}</TableCell>
                    <TableCell className="text-sm">{e._count.facturas}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(e.creadoEn).toLocaleDateString("es-EC")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
