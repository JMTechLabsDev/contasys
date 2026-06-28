import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Mail, Phone } from "lucide-react";

export default function AdminSoportePage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Centro de Soporte</h1>
        <p className="text-muted-foreground">Gestión de tickets y canales de soporte</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Tickets</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Próximamente: sistema de tickets integrado</p>
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Módulo en desarrollo
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Email</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Configuración de canales de soporte por email</p>
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Próximamente
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> Contacto</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Información de contacto del equipo ContaSys</p>
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Próximamente
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
