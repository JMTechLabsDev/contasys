import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const hoy = new Date();
  const resultados: { facturaId: string; cliente: string; email: string; estado: string }[] = [];

  const facturas = await prisma.factura.findMany({
    where: {
      estado: "autorizado",
      fechaVencimiento: { lte: hoy },
    },
    include: {
      cliente: { select: { nombre: true, email: true } },
      empresa: { select: { nombre: true, email: true } },
      pagos: { select: { monto: true } },
    },
  });

  for (const f of facturas) {
    if (!f.cliente.email) {
      resultados.push({ facturaId: f.id, cliente: f.cliente.nombre, email: "", estado: "sin_email" });
      continue;
    }

    const pagado = f.pagos.reduce((s, p) => s + Number(p.monto), 0);
    const saldo = Number(f.total) - pagado;
    if (saldo <= 0) {
      resultados.push({ facturaId: f.id, cliente: f.cliente.nombre, email: f.cliente.email, estado: "pagado" });
      continue;
    }

    const totalFormatted = saldo.toLocaleString("en-US", { style: "currency", currency: "USD" });
    const diasVencido = Math.floor((hoy.getTime() - new Date(f.fechaVencimiento!).getTime()) / (1000 * 60 * 60 * 24));
    const asunto = `Recordatorio de pago - ${f.numeroFactura}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${f.empresa.nombre}</h1>
        </div>
        <div style="padding: 24px; background: #f8fafc;">
          <p>Hola <strong>${f.cliente.nombre}</strong>,</p>
          <p>Te recordamos que la factura <strong>${f.numeroFactura}</strong> tiene un saldo pendiente de <strong>${totalFormatted}</strong>.</p>
          ${diasVencido > 0 ? `<p style="color: #dc2626;">La factura venceció hace <strong>${diasVencido} días</strong>.</p>` : `<p>La factura está próxima a vencer.</p>`}
          <p>Por favor realiza el pago a la brevedad.</p>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p>ContaSys — Sistema de Facturación Electrónica</p>
        </div>
      </div>
    `;

    try {
      const smtpHost = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const from = f.empresa.email || "noreply@contasys.app";

      if (smtpHost && smtpUser) {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.default.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: smtpUser, pass: smtpPass },
        });
        await transporter.sendMail({ from, to: f.cliente.email, subject: asunto, html });
      } else if (process.env.RESEND_API_KEY) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ from, to: f.cliente.email, subject: asunto, html }),
        });
        if (!res.ok) throw new Error("Error Resend");
      } else {
        console.log(`📧 Recordatorio ${f.numeroFactura} -> ${f.cliente.email}: ${asunto}`);
      }

      resultados.push({ facturaId: f.id, cliente: f.cliente.nombre, email: f.cliente.email, estado: "enviado" });
    } catch {
      resultados.push({ facturaId: f.id, cliente: f.cliente.nombre, email: f.cliente.email, estado: "error_envio" });
    }
  }

  return NextResponse.json({ procesadas: resultados.length, resultados });
}
