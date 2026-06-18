"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InvoicePDF } from "@/lib/pdf/factura-pdf";
import { Eye, Printer, Download } from "lucide-react";

type FacturaPreviewProps = {
  factura: {
    numeroFactura: string;
    fechaEmision: Date;
    tipoComprobante: string;
    estado: string;
    subtotal: number;
    descuento: number;
    iva: number;
    total: number;
    observaciones?: string | null;
    metodoPago?: string | null;
    cliente: {
      nombre: string;
      identificacion: string;
      direccion?: string | null;
      telefono?: string | null;
      email?: string | null;
    };
    facturaItems: Array<{
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
      descuento: number;
      subtotal: number;
      iva: number;
      total: number;
    }>;
  };
  empresa: {
    nombre: string;
    ruc: string;
    direccion?: string | null;
    telefono?: string | null;
    email?: string | null;
    ciudad?: string | null;
  };
};

export function FacturaPreview({ factura, empresa }: FacturaPreviewProps) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const content = document.getElementById("invoice-print-content");
    if (!content) return;

    printWindow.document.write(`
      <html><head><title>Factura ${factura.numeroFactura}</title></head><body>
      ${content.innerHTML}
      <script>window.onload = function() { window.print(); window.close(); };</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline"><Eye className="h-4 w-4" /> Vista Previa</Button>} />
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vista Previa — Factura {factura.numeroFactura}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4 no-print">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Download className="h-4 w-4" /> Descargar PDF
          </Button>
        </div>

        <div id="invoice-print-content">
          <InvoicePDF
            numeroFactura={factura.numeroFactura}
            fechaEmision={factura.fechaEmision}
            tipoComprobante={factura.tipoComprobante}
            estado={factura.estado}
            cliente={factura.cliente}
            empresa={empresa}
            items={factura.facturaItems}
            subtotal={Number(factura.subtotal)}
            descuento={Number(factura.descuento)}
            iva={Number(factura.iva)}
            total={Number(factura.total)}
            observaciones={factura.observaciones}
            metodoPago={factura.metodoPago}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
