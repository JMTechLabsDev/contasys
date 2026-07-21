import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validations/auth";

function getAppUrl(request: Request) {
  return (process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin).replace(/\/$/, "");
}

export async function POST(request: Request) {
  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const { nombre, email, password } = parsed.data;
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, rol_plataforma: "usuario" }, emailRedirectTo: getAppUrl(request) },
    });
    if (error)
      return NextResponse.json(
        { error: "No pudimos crear tu cuenta. Inténtalo nuevamente." },
        { status: 400 },
      );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
