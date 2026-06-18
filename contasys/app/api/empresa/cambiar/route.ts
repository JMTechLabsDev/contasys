import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const formData = await req.formData();
  const empresaId = formData.get("empresaId") as string;

  if (!empresaId) {
    return new Response("empresaId required", { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set("empresa_activa", empresaId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  redirect("/dashboard");
}
