import Link from "next/link";
import {
  FileText,
  Users,
  Package,
  BarChart3,
  Shield,
  Building2,
  Receipt,
  CreditCard,
  FileSpreadsheet,
  ChevronRight,
  Check,
  Star,
  ArrowRight,
  PieChart,
  TrendingUp,
  Clock,
  Zap,
  Download,
  Mail,
  Monitor,
  Hexagon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const beneficios = [
  {
    icon: Shield,
    title: "Cumplimiento SRI",
    desc: "Facturas electrónicas válidas ante el SRI. XML RIDE, firma electrónica y envío automático.",
  },
  {
    icon: Building2,
    title: "Multiempresa",
    desc: "Administra todas tus empresas desde una sola cuenta. Datos completamente aislados.",
  },
  {
    icon: Users,
    title: "Multiusuario",
    desc: "Invita a tu equipo con roles y permisos granulares: contador, vendedor, administrador.",
  },
  {
    icon: BarChart3,
    title: "Reportes Fiscales",
    desc: "Reportes de IVA, retenciones, ventas y más. Exporta a Excel o PDF.",
  },
  {
    icon: CreditCard,
    title: "Cuentas por Cobrar",
    desc: "Controla tus cobros pendientes, vencimientos y recibos. Recordatorios automáticos.",
  },
  {
    icon: Zap,
    title: "Rápido y Simple",
    desc: "Interfaz moderna y rápida. Crea facturas en segundos con búsqueda inteligente.",
  },
];

const caracteristicas = [
  {
    icon: FileText,
    title: "Facturación Electrónica",
    desc: "Crea, envía y autoriza facturas electrónicas con un clic. Notas de crédito, débito y retenciones.",
  },
  {
    icon: Receipt,
    title: "Múltiples Comprobantes",
    desc: "Facturas, notas de crédito, notas de débito, retenciones y guías de remisión.",
  },
  {
    icon: Users,
    title: "Gestión de Clientes",
    desc: "Base de datos de clientes con historial de facturas, pagos y saldos pendientes.",
  },
  {
    icon: Package,
    title: "Productos y Servicios",
    desc: "Catálogo de productos con precios, costos, stock y control de rentabilidad.",
  },
  {
    icon: PieChart,
    title: "Dashboard y KPIs",
    desc: "Visualiza tus ventas del día, mes y año. Gráficos interactivos con Recharts.",
  },
  {
    icon: TrendingUp,
    title: "Reportes Avanzados",
    desc: "Reportes de ventas, clientes, productos, IVA y retenciones. Exportación a múltiples formatos.",
  },
  {
    icon: Download,
    title: "PDF Profesional",
    desc: "Generación automática de PDF con diseño profesional listo para imprimir y enviar.",
  },
  {
    icon: Mail,
    title: "Envío por Email",
    desc: "Envía facturas y comprobantes a tus clientes directamente desde la plataforma.",
  },
  {
    icon: Clock,
    title: "Facturación Recurrente",
    desc: "Programa facturas recurrentes para tus clientes frecuentes y olvídate de las tareas repetitivas.",
  },
];

const testimonios = [
  {
    nombre: "María González",
    rol: "Contadora Pública",
    texto: "ContaSys me ha ahorrado horas de trabajo. Mis clientes reciben sus facturas al instante y todo queda registrado para la declaración de impuestos.",
    estrellas: 5,
  },
  {
    nombre: "Carlos Mendoza",
    rol: "Dueño de Ferretería",
    texto: "Pasé de Excel y facturas a mano a un sistema completo. En una semana ya estaba facturando electrónicamente sin problemas.",
    estrellas: 5,
  },
  {
    nombre: "Andrea Paz",
    rol: "Gerente de Agencia",
    texto: "El módulo multiempresa es exactamente lo que necesitábamos. Manejamos 3 empresas desde una sola cuenta con total separación de datos.",
    estrellas: 5,
  },
];

const comparaciones = [
  {
    aspecto: "Tiempo por factura",
    excel: "15-20 min",
    contasys: "2-3 min",
  },
  {
    aspecto: "Cumplimiento SRI",
    excel: "Manual / Error prone",
    contasys: "Automático",
  },
  {
    aspecto: "Control de cobros",
    excel: "Hojas sueltas",
    contasys: "Dashboard integrado",
  },
  {
    aspecto: "Reportes fiscales",
    excel: "Cálculos manuales",
    contasys: "Un clic",
  },
  {
    aspecto: "Multiempresa",
    excel: "Archivos separados",
    contasys: "Todo en uno",
  },
  {
    aspecto: "Backup y seguridad",
    excel: "Tu responsabilidad",
    contasys: "Automático en la nube",
  },
];

const faq = [
  {
    p: "¿Qué necesito para empezar a facturar?",
    r: "Solo tu RUC y correo electrónico. Al registrarte obtienes 14 días de prueba gratuita sin compromiso.",
  },
  {
    p: "¿Las facturas son válidas ante el SRI?",
    r: "Sí. ContaSys genera facturas electrónicas con la estructura XML RIDE oficial del SRI, listas para ser firmadas y enviadas.",
  },
  {
    p: "¿Puedo tener varias empresas en una cuenta?",
    r: "Sí. Los planes Empresarial y Corporativo incluyen multiempresa. Puedes administrar todas tus empresas desde un solo dashboard.",
  },
  {
    p: "¿Cómo funcionan los roles de usuario?",
    r: "Puedes invitar a tu equipo asignando roles específicos: administrador, contador, facturación o vendedor. Cada rol tiene permisos definidos.",
  },
  {
    p: "¿Puedo exportar mis datos?",
    r: "Sí. Puedes exportar clientes, productos y reportes a Excel y CSV. Las facturas se exportan en PDF y XML.",
  },
  {
    p: "¿Qué métodos de pago aceptan?",
    r: "Aceptamos pagos con tarjeta de crédito y débito a través de PayPal. Próximamente añadiremos más métodos.",
  },
];

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <BeneficiosSection />
      <CaracteristicasSection />
      <MockupsSection />
      <ComparacionSection />
      <CasosUsoSection />
      <IntegracionesSection />
      <TestimoniosSection />
      <PreciosSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="container mx-auto px-4 py-20 md:py-32 text-center">
        <div className="mx-auto inline-flex items-center rounded-full border bg-muted/50 px-4 py-1.5 text-sm mb-6">
          <span className="text-muted-foreground">Nuevo</span>
          <span className="mx-2 text-muted-foreground">·</span>
          <span className="font-medium">Prueba gratuita 14 días</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
          Facturación Electrónica{" "}
          <span className="text-primary">simple y conforme al SRI</span> para
          tu negocio en Ecuador
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          La plataforma SaaS que simplifica tu facturación electrónica. Crea,
          envía y autoriza comprobantes electrónicos válidos ante el SRI en
          minutos. Multiempresa, multiusuario y sin complicaciones.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/registro"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Prueba Gratis 14 Días
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/#caracteristicas"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-8 py-3.5 text-base font-medium hover:bg-accent transition-colors"
          >
            Ver Características
          </Link>
        </div>
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-primary" /> Sin tarjeta
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-primary" /> Soporte incluido
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-primary" /> Cancela cuando quieras
          </span>
        </div>
      </div>
    </section>
  );
}

function BeneficiosSection() {
  return (
    <section id="beneficios" className="border-b py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">¿Por qué elegir ContaSys?</h2>
          <p className="mt-2 text-muted-foreground">
            Todo lo que necesitas para administrar tu negocio en un solo lugar
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {beneficios.map((b) => (
            <div
              key={b.title}
              className="rounded-xl border p-6 hover:border-primary/50 transition-colors"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaracteristicasSection() {
  return (
    <section id="caracteristicas" className="border-b py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Todo lo que necesitas</h2>
          <p className="mt-2 text-muted-foreground">
            Funcionalidades completas para tu negocio
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {caracteristicas.map((c) => (
            <div
              key={c.title}
              className="rounded-xl border bg-background p-6 hover:shadow-md transition-shadow"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <c.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MockupsSection() {
  return (
    <section id="mockups" className="border-b py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Así funciona ContaSys</h2>
          <p className="mt-2 text-muted-foreground">
            Interfaz moderna, limpia y fácil de usar
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {[
            {
              icon: BarChart3,
              title: "Dashboard",
              desc: "Resumen de ventas, facturas del día y KPIs clave de tu negocio.",
            },
            {
              icon: FileText,
              title: "Nueva Factura",
              desc: "Crea facturas en segundos con búsqueda inteligente de clientes y productos.",
            },
            {
              icon: Users,
              title: "Gestión de Clientes",
              desc: "Lista completa de clientes con historial de facturas, pagos y saldos.",
            },
            {
              icon: Package,
              title: "Catálogo Productos",
              desc: "Administra precios, costos, stock y categorías de productos y servicios.",
            },
            {
              icon: PieChart,
              title: "Reportes",
              desc: "Reportes de ventas, IVA, retenciones y más con exportación a Excel.",
            },
            {
              icon: CreditCard,
              title: "Cuentas por Cobrar",
              desc: "Control de cobros pendientes con indicadores de vencimiento.",
            },
          ].map((m) => (
            <div key={m.title} className="group relative rounded-xl border bg-background p-6 hover:shadow-lg transition-all">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <m.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{m.title}</h3>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparacionSection() {
  return (
    <section className="border-b py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">
            Deja atrás Excel y los procesos manuales
          </h2>
          <p className="mt-2 text-muted-foreground">
            ContaSys vs métodos tradicionales
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-4 mb-2 px-4">
            <div />
            <div className="text-center font-semibold text-sm flex items-center justify-center gap-1">
              <FileSpreadsheet className="h-4 w-4" /> Excel / Manual
            </div>
            <div className="text-center font-semibold text-sm flex items-center justify-center gap-1">
              <Zap className="h-4 w-4 text-primary" /> ContaSys
            </div>
          </div>
          {comparaciones.map((c) => (
            <div
              key={c.aspecto}
              className="grid grid-cols-3 gap-4 items-center rounded-lg px-4 py-3 odd:bg-muted/50"
            >
              <span className="text-sm font-medium">{c.aspecto}</span>
              <span className="text-center text-sm text-muted-foreground">
                {c.excel}
              </span>
              <span className="text-center text-sm font-medium text-primary">
                {c.contasys}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-destructive" />
              Procesos manuales
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive">✕</span> Facturas una por una
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✕</span> Cálculos manuales propensos a errores
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✕</span> Sin control de cobros
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✕</span> Reportes fiscales tediosos
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✕</span> Sin respaldo automático
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              ContaSys
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span> Facturas en segundos
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span> Cálculos automáticos
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span> Dashboard de cobros integrado
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span> Reportes fiscales en 1 clic
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span> Backup automático en la nube
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function CasosUsoSection() {
  return (
    <section className="border-b py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Para todo tipo de negocio</h2>
          <p className="mt-2 text-muted-foreground">
            Soluciones adaptadas a tu industria
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              emoji: "💼",
              tit: "Freelancers",
              desc: "Profesionales independientes que necesitan facturar rápido y sin complicaciones.",
            },
            {
              emoji: "🏪",
              tit: "Comercios",
              desc: "Tiendas, ferreterías, almacenes y distribuidores con facturación diaria.",
            },
            {
              emoji: "🏢",
              tit: "PYMEs",
              desc: "Empresas en crecimiento que requieren control de clientes, productos y cobros.",
            },
            {
              emoji: "📊",
              tit: "Contadores",
              desc: "Estudios contables que administran múltiples clientes y empresas.",
            },
            {
              emoji: "🏗️",
              tit: "Distribuidores",
              desc: "Negocios con alto volumen de facturación y gestión de inventario.",
            },
            {
              emoji: "🤝",
              tit: "Agencias",
              desc: "Agencias de servicios que manejan proyectos, clientes y facturación recurrente.",
            },
          ].map((c) => (
            <div
              key={c.tit}
              className="rounded-xl border bg-background p-6 hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mb-3 block">{c.emoji}</span>
              <h3 className="font-semibold mb-2">{c.tit}</h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntegracionesSection() {
  return (
    <section className="border-b py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Integraciones</h2>
          <p className="mt-2 text-muted-foreground">
            Conecta ContaSys con las herramientas que ya usas
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 max-w-3xl mx-auto">
          {[
            { name: "PayPal", desc: "Pagos de suscripciones seguros" },
            { name: "Supabase", desc: "Base de datos en la nube" },
            { name: "SRI", desc: "Cumplimiento tributario Ecuador" },
            { name: "Resend", desc: "Correos transaccionales" },
            { name: "PDF", desc: "Comprobantes profesionales" },
            { name: "Excel/CSV", desc: "Exportación de datos" },
          ].map((i) => (
            <div
              key={i.name}
              className="flex flex-col items-center gap-2 rounded-xl border bg-background px-6 py-4 hover:border-primary/50 transition-colors"
            >
              <Hexagon className="h-8 w-8 text-primary" />
              <span className="font-semibold text-sm">{i.name}</span>
              <span className="text-xs text-muted-foreground text-center">{i.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimoniosSection() {
  return (
    <section className="border-b py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Lo que dicen nuestros usuarios</h2>
          <p className="mt-2 text-muted-foreground">
            Miles de negocios ya confían en ContaSys
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonios.map((t) => (
            <div
              key={t.nombre}
              className="rounded-xl border p-6 flex flex-col"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.estrellas }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground flex-1">&ldquo;{t.texto}&rdquo;</p>
              <div className="mt-4 pt-4 border-t">
                <p className="font-semibold text-sm">{t.nombre}</p>
                <p className="text-xs text-muted-foreground">{t.rol}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PreciosSection() {
  return (
    <section className="border-b py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Planes y Precios</h2>
          <p className="mt-2 text-muted-foreground">
            Elige el plan que mejor se adapte a tu negocio
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {[
            {
              nombre: "Emprendedor",
              precio: "$9.99",
              periodo: "/mes",
              facturas: "50 facturas/mes",
              usuarios: "1 usuario",
              multiempresa: false,
              reportes: false,
              api: false,
              popular: false,
            },
            {
              nombre: "Profesional",
              precio: "$19.99",
              periodo: "/mes",
              facturas: "200 facturas/mes",
              usuarios: "3 usuarios",
              multiempresa: false,
              reportes: true,
              api: false,
              popular: true,
            },
            {
              nombre: "Empresarial",
              precio: "$39.99",
              periodo: "/mes",
              facturas: "1,000 facturas/mes",
              usuarios: "10 usuarios",
              multiempresa: true,
              reportes: true,
              api: true,
              popular: false,
            },
            {
              nombre: "Corporativo",
              precio: "$79.99",
              periodo: "/mes",
              facturas: "Ilimitadas",
              usuarios: "Ilimitados",
              multiempresa: true,
              reportes: true,
              api: true,
              popular: false,
            },
          ].map((plan) => (
            <div
              key={plan.nombre}
              className={`rounded-xl border bg-background p-6 flex flex-col ${
                plan.popular ? "ring-2 ring-primary relative" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Más popular
                </span>
              )}
              <h3 className="text-lg font-bold">{plan.nombre}</h3>
              <div className="mt-3">
                <span className="text-3xl font-bold">{plan.precio}</span>
                <span className="text-sm text-muted-foreground">
                  {plan.periodo}
                </span>
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {plan.facturas}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {plan.usuarios}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  {plan.multiempresa ? (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <span className="h-4 w-4 shrink-0" />
                  )}
                  {plan.multiempresa ? "Multiempresa" : "1 empresa"}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  {plan.reportes ? (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <span className="h-4 w-4 shrink-0" />
                  )}
                  {plan.reportes
                    ? "Reportes avanzados"
                    : "Reportes básicos"}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  {plan.api ? (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <span className="h-4 w-4 shrink-0" />
                  )}
                  {plan.api ? "API Access" : "Sin API"}
                </li>
              </ul>
              <Link
                href="/registro"
                className={`mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input bg-background hover:bg-accent"
                }`}
              >
                Empezar Prueba Gratis
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Todos los planes incluyen 14 días de prueba gratuita. Sin tarjeta de
          crédito. Cancela cuando quieras.
        </p>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="border-b py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">
            Preguntas Frecuentes
          </h2>
          <p className="mt-2 text-muted-foreground">
            Resolvemos tus dudas
          </p>
        </div>
        <div className="space-y-4">
          {faq.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl border p-4 [&_summary]:open:pb-3"
            >
              <summary className="flex cursor-pointer items-center justify-between font-medium text-sm [&::-webkit-details-marker]:hidden">
                {item.p}
                <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
              </summary>
              <p className="text-sm text-muted-foreground">{item.r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">
            Comienza a facturar electrónicamente hoy
          </h2>
          <p className="mt-4 text-muted-foreground">
            Únete a miles de negocios en Ecuador que ya confían en ContaSys.
            Prueba gratuita de 14 días, sin compromiso.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/registro"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Prueba Gratis 14 Días
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/precios"
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-8 py-3.5 text-base font-medium hover:bg-accent transition-colors"
            >
              Ver Planes
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
