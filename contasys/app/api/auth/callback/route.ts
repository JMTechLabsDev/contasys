import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const nombre =
          user.user_metadata?.nombre ??
          user.user_metadata?.full_name ??
          user.email?.split("@")[0] ??
          "Usuario";

        const { createAdminClient } = await import("@/lib/supabase/admin");
        const adminClient = createAdminClient();
        const { prisma } = await import("@/lib/prisma/client");

        await prisma.usuario.upsert({
          where: { id: user.id },
          update: { nombre, email: user.email! },
          create: {
            id: user.id,
            nombre,
            email: user.email!,
          },
        });

        const empresaUsuario = await prisma.empresaUsuario.findFirst({
          where: { usuarioId: user.id, activo: true },
        });

        const redirectTo = empresaUsuario ? "/dashboard" : "/onboarding";

        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        const url = isLocalEnv
          ? `${origin}${redirectTo}`
          : forwardedHost
            ? `https://${forwardedHost}${redirectTo}`
            : `${origin}${redirectTo}`;

        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=code_exchange_failed`);
}
