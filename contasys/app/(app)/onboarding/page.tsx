"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Building2 } from "lucide-react";

import { crearEmpresa } from "@/actions/empresa";
import { empresaSchema, type EmpresaInput } from "@/lib/validations/auth";
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

export default function OnboardingPage() {
  const [state, formAction, pending] = useActionState(crearEmpresa, null);

  const {
    register,
    formState: { errors },
  } = useForm<EmpresaInput>({
    resolver: zodResolver(empresaSchema),
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Configura tu Empresa</CardTitle>
          <CardDescription>
            Ingresa los datos de tu empresa para comenzar a facturar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre comercial <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombre"
                  {...register("nombre")}
                  placeholder="Mi Empresa"
                />
                {errors.nombre && (
                  <p className="text-sm text-destructive">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="razonSocial">
                  Razón Social <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="razonSocial"
                  {...register("razonSocial")}
                  placeholder="Mi Empresa S.A.S."
                />
                {errors.razonSocial && (
                  <p className="text-sm text-destructive">
                    {errors.razonSocial.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruc">
                RUC <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ruc"
                {...register("ruc")}
                placeholder="1234567890001"
                maxLength={13}
              />
              {errors.ruc && (
                <p className="text-sm text-destructive">{errors.ruc.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="empresa@correo.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  {...register("telefono")}
                  placeholder="0999999999"
                />
                {errors.telefono && (
                  <p className="text-sm text-destructive">
                    {errors.telefono.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                {...register("direccion")}
                placeholder="Av. Principal y calle secundaria"
              />
              {errors.direccion && (
                <p className="text-sm text-destructive">
                  {errors.direccion.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  {...register("ciudad")}
                  placeholder="Quito"
                />
                {errors.ciudad && (
                  <p className="text-sm text-destructive">
                    {errors.ciudad.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="provincia">Provincia</Label>
                <Input
                  id="provincia"
                  {...register("provincia")}
                  placeholder="Pichincha"
                />
                {errors.provincia && (
                  <p className="text-sm text-destructive">
                    {errors.provincia.message}
                  </p>
                )}
              </div>
            </div>

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Empresa y Comenzar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
