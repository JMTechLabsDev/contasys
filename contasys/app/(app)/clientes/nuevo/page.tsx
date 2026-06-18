import { ClienteForm } from "../cliente-form";

export default function NuevoClientePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Cliente</h1>
        <p className="text-muted-foreground">Registra un nuevo cliente en tu empresa</p>
      </div>
      <ClienteForm />
    </div>
  );
}
