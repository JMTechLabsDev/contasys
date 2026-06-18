"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";

import { recuperar } from "@/actions/auth";
import { recuperarSchema, type RecuperarInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RecuperarPage() {
  const [state, formAction, pending] = useActionState(recuperar, null);

  const {
    register,
    formState: { errors },
  } = useForm<RecuperarInput>({
    resolver: zodResolver(recuperarSchema),
  });

  if (state?.success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <MailCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Revisa tu Correo</CardTitle>
          <CardDescription>
            Si existe una cuenta con ese correo, recibirás un enlace para
            restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Iniciar Sesión
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Recuperar Contraseña</CardTitle>
        <CardDescription>
          Te enviaremos un enlace para restablecer tu contraseña
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar Enlace
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary">
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            Volver a Iniciar Sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
