"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import Link from "next/link";

type ImportState = { error?: string; success?: boolean; count?: number };

async function importarProductos(_prev: ImportState | null, formData: FormData): Promise<ImportState> {
  const file = formData.get("archivo") as File;
  if (!file) return { error: "Selecciona un archivo CSV" };

  const text = await file.text();
  const lines = text.split("\n").filter(Boolean);
  if (lines.length < 2) return { error: "El archivo está vacío o solo tiene encabezados" };

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  if (!headers.includes("nombre")) return { error: 'Falta la columna requerida: "nombre"' };

  const productos: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map((v) => v.trim());
    if (vals.length !== headers.length || vals.every((v) => !v)) continue;
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = vals[idx] || ""; });
    if (!obj.nombre) continue;
    productos.push(obj);
  }

  if (productos.length === 0) return { error: "No se encontraron registros válidos" };

  try {
    const res = await fetch("/api/productos/importar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productos }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Error al importar" };
    return { success: true, count: data.count };
  } catch {
    return { error: "Error de conexión al importar" };
  }
}

export default function ImportarProductosPage() {
  const [state, formAction, pending] = useActionState<ImportState | null, FormData>(importarProductos, null);

  if (state?.success) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center space-y-4">
        <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Importación Exitosa</h1>
        <p className="text-muted-foreground">
          Se importaron <strong>{state.count}</strong> producto{state.count !== 1 ? "s" : ""} correctamente.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/productos" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Ver Productos
          </Link>
          <Button variant="outline" onClick={() => window.location.reload()}>Importar Otro</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Importar Productos</h1>
        <p className="text-muted-foreground">Sube un archivo CSV con los datos de tus productos.</p>
      </div>

      <div className="rounded-lg border p-4 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">Formato esperado:</p>
        <code className="text-xs block">nombre,sku,descripcion,categoria,precio,costo,impuesto,stock</code>
        <code className="text-xs block">Laptop Pro,LP-001,Laptop 16GB RAM,Tecnología,1299.99,950.00,15%,10</code>
        <Link href="/api/productos/exportar?formato=ejemplo" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
          <Download className="h-3 w-3" />
          Descargar plantilla
        </Link>
      </div>

      {state?.error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>}

      <form action={formAction} className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent/50 transition-colors">
          <input type="file" name="archivo" accept=".csv" required className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>{pending ? "Importando..." : "Importar"}</Button>
          <Link href="/productos"><Button type="button" variant="outline">Cancelar</Button></Link>
        </div>
      </form>
    </div>
  );
}
