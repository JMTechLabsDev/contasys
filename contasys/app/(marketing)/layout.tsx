import type { Metadata } from "next";
import Link from "next/link";
import { Menu } from "lucide-react";

export const metadata: Metadata = {
  title: "ContaSys | Facturación Electrónica para Ecuador",
  description:
    "Plataforma SaaS de facturación electrónica con cumplimiento SRI. Multiempresa, multiusuario, reportes y más. Prueba gratis 14 días.",
  openGraph: {
    title: "ContaSys | Facturación Electrónica para Ecuador",
    description:
      "La plataforma SaaS que simplifica tu facturación electrónica con cumplimiento SRI.",
    locale: "es_EC",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold">
          ContaSys
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#beneficios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Beneficios
          </Link>
          <Link href="/#caracteristicas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Características
          </Link>
          <Link href="/precios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Precios
          </Link>
          <Link href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden md:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Prueba Gratis
          </Link>
          <button className="md:hidden p-2" aria-label="Menú">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold mb-3">ContaSys</h3>
            <p className="text-sm text-muted-foreground">
              Facturación electrónica para Ecuador, simple y conforme al SRI.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-3">Producto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#caracteristicas" className="hover:text-foreground transition-colors">Características</Link></li>
              <li><Link href="/precios" className="hover:text-foreground transition-colors">Precios</Link></li>
              <li><Link href="/#faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terminos" className="hover:text-foreground transition-colors">Términos y Condiciones</Link></li>
              <li><Link href="/privacidad" className="hover:text-foreground transition-colors">Política de Privacidad</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>soporte@contasys.ec</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ContaSys. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
