import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | ContaSys",
  description: "Términos y condiciones de uso de ContaSys, plataforma de facturación electrónica para Ecuador.",
};

export default function TerminosPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Términos y Condiciones</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>
          Bienvenido a ContaSys. Al acceder y utilizar nuestra plataforma de facturación
          electrónica, aceptas cumplir con los siguientes términos y condiciones.
        </p>
        <h2 className="text-lg font-semibold text-foreground mt-6">1. Uso del Servicio</h2>
        <p>
          ContaSys proporciona un servicio SaaS de facturación electrónica. El usuario se
          compromete a usar el servicio de acuerdo con la legislación ecuatoriana vigente.
        </p>
        <h2 className="text-lg font-semibold text-foreground mt-6">2. Registro y Cuenta</h2>
        <p>
          Para utilizar el servicio, debes registrarte proporcionando información veraz.
          Eres responsable de mantener la confidencialidad de tus credenciales de acceso.
        </p>
        <h2 className="text-lg font-semibold text-foreground mt-6">3. Planes y Facturación</h2>
        <p>
          Los precios y planes están especificados en nuestra página de precios. Los pagos
          se procesan de forma segura a través de PayPal. Puedes cancelar tu suscripción
          en cualquier momento.
        </p>
        <h2 className="text-lg font-semibold text-foreground mt-6">4. Propiedad Intelectual</h2>
        <p>
          Todo el contenido, diseño y código de ContaSys es propiedad de la empresa.
          El usuario no adquiere ningún derecho de propiedad sobre el software.
        </p>
        <h2 className="text-lg font-semibold text-foreground mt-6">5. Limitación de Responsabilidad</h2>
        <p>
          ContaSys no se responsabiliza por daños directos o indirectos derivados del uso
          de la plataforma. El usuario es responsable por la veracidad de los datos ingresados.
        </p>
        <h2 className="text-lg font-semibold text-foreground mt-6">6. Privacidad de Datos</h2>
        <p>
          El tratamiento de datos personales se rige por nuestra Política de Privacidad.
          ContaSys implementa medidas de seguridad para proteger la información.
        </p>
        <h2 className="text-lg font-semibold text-foreground mt-6">7. Modificaciones</h2>
        <p>
          Nos reservamos el derecho de modificar estos términos en cualquier momento.
          Los cambios serán notificados a los usuarios registrados.
        </p>
        <p className="pt-4 text-xs">
          Última actualización: Junio 2026
        </p>
      </div>
    </div>
  );
}
