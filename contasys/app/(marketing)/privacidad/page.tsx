import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | ContaSys",
  description: "Política de privacidad de ContaSys. Conoce cómo protegemos y gestionamos tus datos personales.",
};

export default function PrivacidadPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>
          En ContaSys, nos tomamos muy en serio la privacidad de tus datos. Esta política
          describe cómo recopilamos, usamos y protegemos tu información personal.
        </p>
        <h2 className="text-lg font-semibold text-foreground mt-6">1. Información que Recopilamos</h2>
        <p>
          Recopilamos la información necesaria para proporcionar el servicio: nombre,
          correo electrónico, RUC, y datos de facturación. No recopilamos información
          sensible no relacionada con el servicio.
        </p>
        <h2 className="text-lg font-semibold text-foreground mt-6">2. Uso de la Información</h2>
        <p>
          Utilizamos tu información para: proporcionar el servicio de facturación,
          procesar pagos, enviar notificaciones relacionadas con el servicio, y mejorar
          nuestra plataforma. No vendemos tu información a terceros.
        </p>
        <h2 className="text-lg font-semibold text-foreground mt-6">3. Seguridad de Datos</h2>
        <p>
          Implementamos medidas de seguridad técnicas y organizativas para proteger tus
          datos: encriptación SSL/TLS, almacenamiento seguro en PostgreSQL, y acceso
          restringido a datos sensibles.
        </p>
        <h2 className="text-lg font-semibold text-foreground mt-6">4. Retención de Datos</h2>
        <p>
          Conservamos tus datos mientras mantengas una cuenta activa. Al cancelar tu
          suscripción, puedes solicitar la exportación o eliminación de tus datos.
        </p>
        <h2 className="text-lg font-semibold text-foreground mt-6">5. Tus Derechos</h2>
        <p>
          Tienes derecho a acceder, rectificar y eliminar tus datos personales. Puedes
          ejercer estos derechos contactándonos a soporte@contasys.ec.
        </p>
        <h2 className="text-lg font-semibold text-foreground mt-6">6. Cookies</h2>
        <p>
          Utilizamos cookies esenciales para el funcionamiento de la plataforma. No
          utilizamos cookies de rastreo de terceros con fines publicitarios.
        </p>
        <h2 className="text-lg font-semibold text-foreground mt-6">7. Contacto</h2>
        <p>
          Si tienes preguntas sobre esta política, contáctanos en soporte@contasys.ec.
        </p>
        <p className="pt-4 text-xs">
          Última actualización: Junio 2026
        </p>
      </div>
    </div>
  );
}
