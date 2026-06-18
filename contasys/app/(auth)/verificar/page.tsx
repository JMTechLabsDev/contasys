"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { MailCheck, AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function VerificarContent() {
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");

  const linkClass =
    "inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors";
  const primaryBtnClass =
    `${linkClass} bg-primary text-primary-foreground hover:bg-primary/80`;
  const outlineBtnClass =
    `${linkClass} border-input bg-background hover:bg-accent hover:text-accent-foreground`;

  if (verified === "true") {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <MailCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Correo Verificado</CardTitle>
          <CardDescription>
            Tu correo ha sido verificado exitosamente. Ya puedes iniciar sesión.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/login" className={primaryBtnClass}>
            Iniciar Sesión
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center">
          <MailCheck className="h-12 w-12 text-primary" />
        </div>
        <CardTitle>Verifica tu Correo</CardTitle>
        <CardDescription>
          Te hemos enviado un enlace de verificación. Revisa tu bandeja de
          entrada (y la carpeta de spam) para activar tu cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Link href="/login" className={outlineBtnClass}>
          Ir a Iniciar Sesión
        </Link>
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
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle>Cargando...</CardTitle>
          </CardHeader>
        </Card>
      }
    >
      <VerificarContent />
    </Suspense>
  );
}
