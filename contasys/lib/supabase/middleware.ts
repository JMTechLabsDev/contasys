import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: "contasys" },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/registro") ||
    pathname.startsWith("/recuperar") ||
    pathname.startsWith("/restablecer");

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/precios");

  const isAppRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/facturas") ||
    pathname.startsWith("/clientes") ||
    pathname.startsWith("/productos") ||
    pathname.startsWith("/cuentas-cobrar") ||
    pathname.startsWith("/reportes") ||
    pathname.startsWith("/suscripcion") ||
    pathname.startsWith("/configuracion") ||
    pathname.startsWith("/onboarding");

  const isAdminRoute = pathname.startsWith("/admin");

  const isApiAuthRoute = pathname.startsWith("/api/auth");

  if (!user && (isAppRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isAdminRoute) {
    const rol = user.user_metadata?.rol_plataforma;
    if (rol !== "superadmin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
