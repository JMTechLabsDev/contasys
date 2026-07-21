import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recuperarSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const parsed = recuperarSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Correo electrónico inválido" }, { status: 400 });
  const redirectTo = (process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin).replace(
    /\/$/,
    "",
  );
  const supabase = await createClient();
  await supabase.auth.resend({
    email: parsed.data.email,
    type: "signup",
    options: { emailRedirectTo: redirectTo },
  });
  return NextResponse.json({ success: true });
}
