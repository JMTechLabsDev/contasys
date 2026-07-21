import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, email, password, confirmarPassword } = body;

    if (!nombre || !email || !password || !confirmarPassword) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    if (password !== confirmarPassword) {
      return NextResponse.json({ error: "Las contraseñas no coinciden" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, rol_plataforma: "usuario" },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
