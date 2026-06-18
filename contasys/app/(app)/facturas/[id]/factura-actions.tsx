"use client";

import { actualizarEstadoFactura, eliminarFactura, duplicarFactura, crearNotaCredito, crearNotaDebito } from "@/actions/factura";
import { enviarFacturaEmail } from "@/actions/email";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Copy, Printer, Trash2, Receipt, Mail, Zap, Truck, Percent } from "lucide-react";
import Link from "next/link";

const estadoLabel: Record<string, string> = {
  borrador: "Borrador",
  pendiente: "Pendiente",
  procesando: "Procesando",
  autorizado: "Autorizado",
  rechazado: "Rechazado",
  anulado: "Anulado",
};

export function FacturaActions({
  facturaId,
  estadoActual,
  estadosSiguientes,
  isAnulado,
  esNotaCredito,
  esFactura,
}: {
  facturaId: string;
  estadoActual: string;
  estadosSiguientes: string[];
  isAnulado: boolean;
  esNotaCredito: boolean;
  esFactura: boolean;
}) {
  const router = useRouter();
  const [, duplicarAction, duplicarPending] = useActionState(duplicarFactura, null);
  const [, notaCreditoAction, ncPending] = useActionState(crearNotaCredito, null);
  const [, notaDebitoAction, ndPending] = useActionState(crearNotaDebito, null);
  const [, emailAction, emailPending] = useActionState(enviarFacturaEmail, null);

  if (isAnulado) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
        Esta factura ha sido anulada. No se pueden realizar más cambios.
      </div>
    );
  }

  const handleEstado = async (estado: string) => {
    const fd = new FormData();
    fd.set("id", facturaId);
    fd.set("estado", estado);
    await actualizarEstadoFactura(fd);
    router.refresh();
  };

  const handleEliminar = async () => {
    if (!confirm("¿Estás seguro de eliminar esta factura permanentemente?")) return;
    const fd = new FormData();
    fd.set("id", facturaId);
    await eliminarFactura(fd);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const content = document.getElementById("invoice-print-content");
    if (!content) return;
    printWindow.document.write(`
      <html><head><title>Factura ${facturaId}</title></head><body>
      ${content.innerHTML}
      <script>window.onload = function() { window.print(); window.close(); };</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {estadosSiguientes.map((estado) => (
        <Button
          key={estado}
          variant={estado === "anulado" ? "destructive" : "default"}
          onClick={() => handleEstado(estado)}
        >
          Marcar como {estadoLabel[estado] || estado}
        </Button>
      ))}

      <form action={duplicarAction}>
        <input type="hidden" name="id" value={facturaId} />
        <Button type="submit" variant="outline" disabled={duplicarPending}>
          <Copy className="h-4 w-4" />
          {duplicarPending ? "Duplicando..." : "Duplicar"}
        </Button>
      </form>

      <Link href="/facturas/rapida">
        <Button variant="outline">
          <Zap className="h-4 w-4" />
          Rápida
        </Button>
      </Link>

      <Button variant="outline" onClick={handlePrint}>
        <Printer className="h-4 w-4" />
        Imprimir
      </Button>

      {estadoActual === "autorizado" && esFactura && (
        <>
          <form action={notaCreditoAction}>
            <input type="hidden" name="id" value={facturaId} />
            <Button type="submit" variant="outline" disabled={ncPending}>
              <Receipt className="h-4 w-4" />
              {ncPending ? "Creando..." : "N. Crédito"}
            </Button>
          </form>
          <form action={notaDebitoAction}>
            <input type="hidden" name="id" value={facturaId} />
            <Button type="submit" variant="outline" disabled={ndPending}>
              <Receipt className="h-4 w-4" />
              {ndPending ? "Creando..." : "N. Débito"}
            </Button>
          </form>
          <Link href={`/facturas/retenciones/nueva?facturaId=${facturaId}`}>
            <Button variant="outline">
              <Percent className="h-4 w-4" />
              Retención
            </Button>
          </Link>
          <Link href={`/facturas/guias/nueva?facturaId=${facturaId}`}>
            <Button variant="outline">
              <Truck className="h-4 w-4" />
              Guía Rem.
            </Button>
          </Link>
        </>
      )}

      <form action={emailAction}>
        <input type="hidden" name="id" value={facturaId} />
        <Button type="submit" variant="outline" disabled={emailPending}>
          <Mail className="h-4 w-4" />
          {emailPending ? "Enviando..." : "Email"}
        </Button>
      </form>

      {estadoActual === "borrador" && (
        <Button variant="destructive" onClick={handleEliminar}>
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      )}
    </div>
  );
}
