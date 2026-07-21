"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { login as loginAction, register as registerAction } from "@/actions/auth";
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
                  <Label htmlFor="login-email">Correo electrónico</Label>
                  <Input id="login-email" name="email" type="email" placeholder="correo@ejemplo.com" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Link
                      href="/recuperar"
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Input id="login-password" name="password" type="password" placeholder="Tu contraseña" required />
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
                  <Label htmlFor="reg-name">Nombre completo</Label>
                  <Input id="reg-name" name="nombre" type="text" placeholder="Juan Pérez" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Correo electrónico</Label>
                  <Input id="reg-email" name="email" type="email" placeholder="correo@ejemplo.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-pass">Contraseña</Label>
                  <Input id="reg-pass" name="password" type="password" placeholder="Mínimo 6 caracteres" required minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">Confirmar contraseña</Label>
                  <Input id="reg-confirm" name="confirmarPassword" type="password" placeholder="Repite la contraseña" required />
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
