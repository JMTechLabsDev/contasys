"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegistroPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    }).catch(() => null);
    const result = response ? await response.json().catch(() => ({})) : {};
    setPending(false);

    if (!response?.ok) {
      setError(result.error ?? "No pudimos crear tu cuenta. Inténtalo nuevamente.");
      return;
    }
    setRegisteredEmail(String(formData.get("email") ?? ""));
  }

  if (registeredEmail) {
    return (
      <Card>
        <CardHeader className="text-center">
          <MailCheck className="mx-auto h-12 w-12 text-primary" />
          <CardTitle>Confirma tu correo</CardTitle>
          <CardDescription>
            Enviamos un correo de confirmación a <strong>{registeredEmail}</strong>. Ábrelo para
            activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-center">
          <Link
            className="text-sm font-medium text-primary hover:underline"
            href={`/verificar?email=${encodeURIComponent(registeredEmail)}`}
          >
            No recibí el correo / reenviar
          </Link>
          <p className="text-sm text-muted-foreground">
            ¿Ya confirmaste tu cuenta?{" "}
            <Link className="font-medium text-primary hover:underline" href="/login">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Crea tu cuenta</CardTitle>
        <CardDescription>Regístrate para comenzar a usar ContaSys.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo</Label>
            <Input
              id="nombre"
              name="nombre"
              autoComplete="name"
              required
              minLength={2}
              placeholder="Juan Pérez"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmarPassword">Confirmar contraseña</Label>
            <Input
              id="confirmarPassword"
              name="confirmarPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Repite tu contraseña"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" disabled={pending} type="submit">
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Crear cuenta
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link className="font-medium text-primary hover:underline" href="/login">
            Inicia sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
