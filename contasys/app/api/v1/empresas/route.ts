import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { authenticateApiRequest, apiSuccess, apiError, apiPaginated } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth.authorized) return apiError(auth.status, auth.error, auth.code);

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);

  const [empresas, total] = await Promise.all([
    prisma.empresa.findMany({
      where: { id: auth.empresaId },
      select: { id: true, nombre: true, ruc: true, razonSocial: true, email: true, telefono: true, direccion: true, ciudad: true, provincia: true, regimenTributario: true, ambiente: true, estado: true, creadoEn: true },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.empresa.count({ where: { id: auth.empresaId } }),
  ]);

  return apiPaginated(empresas, total, page, limit);
}
