type FacturaPDFProps = {
  numeroFactura: string;
  fechaEmision: Date;
  tipoComprobante: string;
  estado: string;
  cliente: {
    nombre: string;
    identificacion: string;
    direccion?: string | null;
    telefono?: string | null;
    email?: string | null;
  };
  empresa: {
    nombre: string;
    ruc: string;
    direccion?: string | null;
    telefono?: string | null;
    email?: string | null;
    ciudad?: string | null;
  };
  items: Array<{
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    subtotal: number;
    iva: number;
    total: number;
  }>;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  observaciones?: string | null;
  metodoPago?: string | null;
};

export function InvoicePDF({
  numeroFactura,
  fechaEmision,
  tipoComprobante,
  estado,
  cliente,
  empresa,
  items,
  subtotal,
  descuento,
  iva,
  total,
  observaciones,
  metodoPago,
}: FacturaPDFProps) {
  return (
    <div className="invoice-print">
      <style>{`
        @media print {
          @page { margin: 0.5in; size: letter; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .invoice-print { font-size: 10pt !important; }
          .no-print { display: none !important; }
        }
        .invoice-print { font-family: 'Inter', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px; color: #1a1a2e; }
        .invoice-header { display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #e2e8f0; padding-bottom: 24px; }
        .invoice-company h1 { font-size: 20pt; font-weight: 700; margin: 0; color: #1e3a5f; }
        .invoice-company p { margin: 2px 0; font-size: 9pt; color: #64748b; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { font-size: 18pt; font-weight: 700; margin: 0; text-transform: uppercase; color: #1e3a5f; }
        .invoice-title p { margin: 2px 0; font-size: 9pt; color: #64748b; }
        .invoice-body { display: flex; justify-content: space-between; margin-top: 24px; }
        .invoice-client h3, .invoice-meta h3 { font-size: 9pt; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin: 0 0 8px; }
        .invoice-client p, .invoice-meta p { margin: 2px 0; font-size: 9pt; }
        .invoice-table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        .invoice-table th { background: #1e3a5f; color: white; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 12px; text-align: left; }
        .invoice-table th:last-child { text-align: right; }
        .invoice-table td { padding: 8px 12px; font-size: 9pt; border-bottom: 1px solid #e2e8f0; }
        .invoice-table td:last-child { text-align: right; }
        .invoice-table td:nth-child(3), .invoice-table td:nth-child(4), .invoice-table td:nth-child(5), .invoice-table td:nth-child(6) { text-align: right; }
        .invoice-totals { margin-top: 16px; margin-left: auto; width: 280px; }
        .invoice-totals table { width: 100%; }
        .invoice-totals td { padding: 6px 12px; font-size: 9pt; }
        .invoice-totals td:last-child { text-align: right; font-weight: 600; }
        .invoice-totals .grand-total td { font-size: 12pt; font-weight: 700; border-top: 2px solid #1a1a2e; padding-top: 8px; color: #1e3a5f; }
        .invoice-footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 8pt; color: #94a3b8; text-align: center; }
        .invoice-obs { margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 4px; font-size: 9pt; color: #64748b; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 8pt; font-weight: 600; }
        .badge-borrador { background: #f1f5f9; color: #475569; }
        .badge-pendiente { background: #fef3c7; color: #92400e; }
        .badge-autorizado { background: #d1fae5; color: #065f46; }
        .badge-anulado { background: #fee2e2; color: #991b1b; }
      `}</style>

      <div className="invoice-header">
        <div className="invoice-company">
          <h1>{empresa.nombre}</h1>
          <p>RUC: {empresa.ruc}</p>
          {empresa.direccion && <p>{empresa.direccion}</p>}
          {empresa.ciudad && <p>{empresa.ciudad}</p>}
          {empresa.telefono && <p>Tel: {empresa.telefono}</p>}
          {empresa.email && <p>{empresa.email}</p>}
        </div>
        <div className="invoice-title">
          <h2>{tipoComprobante === "factura" ? "FACTURA" : tipoComprobante.replace("_", " ").toUpperCase()}</h2>
          <p>No. {numeroFactura}</p>
          <p>Fecha: {new Date(fechaEmision).toLocaleDateString("es-EC")}</p>
          <p>
            Estado: <span className={`badge badge-${estado}`}>
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </span>
          </p>
        </div>
      </div>

      <div className="invoice-body">
        <div className="invoice-client">
          <h3>Cliente</h3>
          <p><strong>{cliente.nombre}</strong></p>
          <p>ID: {cliente.identificacion}</p>
          {cliente.direccion && <p>{cliente.direccion}</p>}
          {cliente.telefono && <p>Tel: {cliente.telefono}</p>}
          {cliente.email && <p>{cliente.email}</p>}
        </div>
        <div className="invoice-meta">
          {metodoPago && (
            <>
              <h3>Pago</h3>
              <p>{metodoPago}</p>
            </>
          )}
        </div>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th style={{ width: "50%" }}>Descripción</th>
            <th style={{ width: "10%" }}>Cant.</th>
            <th style={{ width: "12%" }}>P. Unit.</th>
            <th style={{ width: "10%" }}>Desc.</th>
            <th style={{ width: "18%" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>{item.descripcion}</td>
              <td>{item.cantidad}</td>
              <td>${Number(item.precioUnitario).toFixed(2)}</td>
              <td>{Number(item.descuento) > 0 ? `$${Number(item.descuento).toFixed(2)}` : "—"}</td>
              <td>${Number(item.total).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-totals">
        <table>
          <tbody>
            <tr><td>Subtotal</td><td>${Number(subtotal).toFixed(2)}</td></tr>
            {Number(descuento) > 0 && <tr><td>Descuento</td><td>-${Number(descuento).toFixed(2)}</td></tr>}
            <tr><td>IVA (15%)</td><td>${Number(iva).toFixed(2)}</td></tr>
            <tr className="grand-total"><td>TOTAL</td><td>${Number(total).toFixed(2)}</td></tr>
          </tbody>
        </table>
      </div>

      {observaciones && (
        <div className="invoice-obs">
          <strong>Observaciones:</strong>
          <p style={{ margin: "4px 0 0" }}>{observaciones}</p>
        </div>
      )}

      <div className="invoice-footer">
        <p>ContaSys — Sistema de Facturación Electrónica</p>
        <p>Este documento no tiene validez fiscal hasta ser autorizado por el SRI</p>
      </div>
    </div>
  );
}

export function InvoicePrintStyles() {
  return (
    <style>{`
      @media print {
        body > *:not(.invoice-print-area) { display: none !important; }
        .invoice-print-area { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
        @page { margin: 0.5in; size: letter; }
      }
      .invoice-print-area { display: none; }
    `}</style>
  );
}
