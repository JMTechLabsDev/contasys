"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { restablecer } from "@/actions/auth";
import { restablecerSchema, type RestablecerInput } from "@/lib/validations/auth";
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

export default function RestablecerPage() {
  const [state, formAction, pending] = useActionState(restablecer, null);

  const {
    register,
    formState: { errors },
  } = useForm<RestablecerInput>({
    resolver: zodResolver(restablecerSchema),
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Nueva Contraseña</CardTitle>
        <CardDescription>Ingresa tu nueva contraseña</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarPassword">Confirmar contraseña</Label>
            <Input
              id="confirmarPassword"
              type="password"
              {...register("confirmarPassword")}
              placeholder="Repite la contraseña"
            />
            {errors.confirmarPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmarPassword.message}
              </p>
            )}
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Restablecer Contraseña
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
