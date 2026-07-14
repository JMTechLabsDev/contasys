"use client";

import { useState, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2, Mail, Lock, User } from "lucide-react";

import { login as loginAction, register as registerAction } from "@/actions/auth";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/validations/auth";
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

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, null);
  const [registerState, registerFormAction, registerPending] = useActionState(registerAction, null);

  const {
    register: loginFields,
    formState: { errors: loginErrors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerFields,
    formState: { errors: registerErrors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  if (registerState?.success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Verifica tu Correo</CardTitle>
          <CardDescription>
            Te hemos enviado un enlace de verificación. Revisa tu bandeja de
            entrada para activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Ir a Iniciar Sesión
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center pb-0">
        <CardTitle>
          {activeTab === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
        </CardTitle>
        <CardDescription>
          {activeTab === "login"
            ? "Ingresa a tu cuenta de ContaSys"
            : "Completa tus datos para registrarte"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="flex bg-muted rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "login"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "register"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Registrarse
          </button>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex w-[200%] transition-transform duration-500 ease-in-out"
            style={{ transform: activeTab === "login" ? "translateX(0)" : "translateX(-50%)" }}
          >
            <div className="w-1/2 flex-shrink-0 pr-1">
              <form action={loginFormAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      {...loginFields("email")}
                      placeholder="correo@ejemplo.com"
                      className="pl-10"
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="text-sm text-destructive">{loginErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link
                      href="/recuperar"
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      {...loginFields("password")}
                      placeholder="Tu contraseña"
                      className="pl-10"
                    />
                  </div>
                  {loginErrors.password && (
                    <p className="text-sm text-destructive">{loginErrors.password.message}</p>
                  )}
                </div>

                {loginState?.error && (
                  <p className="text-sm text-destructive">{loginState.error}</p>
                )}

                <Button type="submit" className="w-full" disabled={loginPending}>
                  {loginPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Iniciar Sesión
                </Button>
              </form>
            </div>

            <div className="w-1/2 flex-shrink-0 pl-1">
              <form action={registerFormAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nombre"
                      type="text"
                      {...registerFields("nombre")}
                      placeholder="Juan Pérez"
                      className="pl-10"
                    />
                  </div>
                  {registerErrors.nombre && (
                    <p className="text-sm text-destructive">{registerErrors.nombre.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      {...registerFields("email")}
                      placeholder="correo@ejemplo.com"
                      className="pl-10"
                    />
                  </div>
                  {registerErrors.email && (
                    <p className="text-sm text-destructive">{registerErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type="password"
                      {...registerFields("password")}
                      placeholder="Mínimo 6 caracteres"
                      className="pl-10"
                    />
                  </div>
                  {registerErrors.password && (
                    <p className="text-sm text-destructive">{registerErrors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmarPassword"
                      type="password"
                      {...registerFields("confirmarPassword")}
                      placeholder="Repite la contraseña"
                      className="pl-10"
                    />
                  </div>
                  {registerErrors.confirmarPassword && (
                    <p className="text-sm text-destructive">
                      {registerErrors.confirmarPassword.message}
                    </p>
                  )}
                </div>

                {registerState?.error && (
                  <p className="text-sm text-destructive">{registerState.error}</p>
                )}

                <Button type="submit" className="w-full" disabled={registerPending}>
                  {registerPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Cuenta
                </Button>
              </form>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {activeTab === "login" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className="font-medium text-primary hover:underline"
              >
                Registrarse
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="font-medium text-primary hover:underline"
              >
                Iniciar Sesión
              </button>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
