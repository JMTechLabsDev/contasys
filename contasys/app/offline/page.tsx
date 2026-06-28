import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <WifiOff className="h-16 w-16 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-bold">Sin conexión</h1>
        <p className="text-muted-foreground">Verifica tu conexión a internet e intenta de nuevo.</p>
      </div>
    </div>
  );
}
