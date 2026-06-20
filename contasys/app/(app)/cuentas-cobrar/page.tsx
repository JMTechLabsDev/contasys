import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { CuentasCobrarContent } from "./cuentas-cobrar-content";

export default async function CuentasCobrarPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; desde?: string; hasta?: string; estado?: string }>;
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

  const where: any = {
    empresaId: eu.empresaId,
    estado: "autorizado",
  };

  if (sp.cliente) {
    where.cliente = {
      OR: [
        { nombre: { contains: sp.cliente, mode: "insensitive" } },
        { identificacion: { contains: sp.cliente, mode: "insensitive" } },
      ],
    };
  }
  if (sp.desde) where.fechaEmision = { ...where.fechaEmision, gte: new Date(sp.desde) };
  if (sp.hasta) where.fechaEmision = { ...where.fechaEmision, lte: new Date(sp.hasta + "T23:59:59.999Z") };

  const facturas = await prisma.factura.findMany({
    where,
    include: {
      cliente: { select: { id: true, nombre: true, identificacion: true } },
      pagos: { select: { monto: true } },
    },
    orderBy: { fechaEmision: "desc" },
  });

  const clientes = await prisma.cliente.findMany({
    where: { empresaId: eu.empresaId, activo: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  const cuentas: Array<{
    id: string; numeroFactura: string; fechaEmision: Date; fechaVencimiento: Date | null;
    total: number; pagado: number; saldo: number;
    cliente: { id: string; nombre: string; identificacion: string };
  }> = facturas.map((f) => {
    const total = Number(f.total);
    const pagado = f.pagos.reduce((s, p) => s + Number(p.monto), 0);
    return {
      id: f.id, numeroFactura: f.numeroFactura, fechaEmision: f.fechaEmision,
      fechaVencimiento: f.fechaVencimiento, total, pagado, saldo: total - pagado,
      cliente: f.cliente,
    };
  });

  return <CuentasCobrarContent cuentas={cuentas} clientes={clientes} filtros={sp} />;
}
