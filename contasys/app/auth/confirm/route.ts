import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const isSupportedType = type === "email" || type === "recovery";

  if (tokenHash && isSupportedType) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    if (!error) {
      const destination = type === "recovery" ? "/restablecer" : "/onboarding";
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  const errorPage = type === "recovery" ? "/recuperar?error=invalid" : "/verificar?error=invalid";
  return NextResponse.redirect(new URL(errorPage, request.url));
}
