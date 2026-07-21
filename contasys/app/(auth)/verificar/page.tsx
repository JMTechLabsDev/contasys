"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, MailCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function VerificarContent() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const invalid = params.get("error") === "invalid";

  async function resend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const response = await fetch("/api/auth/resend-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setPending(false);
    setMessage(
      response?.ok
        ? "Si la cuenta requiere confirmación, enviamos un nuevo correo."
        : "Escribe un correo válido e inténtalo nuevamente.",
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <MailCheck className="mx-auto h-12 w-12 text-primary" />
        <CardTitle>{invalid ? "El enlace ya no es válido" : "Verifica tu correo"}</CardTitle>
        <CardDescription>
          {invalid
            ? "Solicita un nuevo correo de confirmación."
            : "Confirma tu dirección para activar tu cuenta."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={resend} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Reenviar correo de
            confirmación
          </Button>
        </form>
        {message && <p className="text-center text-sm text-muted-foreground">{message}</p>}
        <p className="text-center text-sm text-muted-foreground">
          <AlertCircle className="mr-1 inline h-4 w-4" />
          Revisa también promociones o spam.{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Ir a iniciar sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function VerificarPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Cargando…</CardTitle>
          </CardHeader>
        </Card>
      }
    >
      <VerificarContent />
    </Suspense>
  );
}
