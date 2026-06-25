import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { authenticateApiRequest, apiSuccess, apiError } from "@/lib/api-auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request);
  if (!auth.authorized) return apiError(auth.status, auth.error, auth.code);

  const { id } = await params;

  if (id !== auth.empresaId) {
    return apiError(403, "No tienes acceso a esta empresa", "FORBIDDEN");
  }

  const empresa = await prisma.empresa.findUnique({
    where: { id },
    select: { id: true, nombre: true, ruc: true, razonSocial: true, email: true, telefono: true, direccion: true, ciudad: true, provincia: true, regimenTributario: true, ambiente: true, estado: true, creadoEn: true },
  });

  if (!empresa) return apiError(404, "Empresa no encontrada", "NOT_FOUND");

  return apiSuccess(empresa);
}
