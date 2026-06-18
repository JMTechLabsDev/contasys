"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

async function getEmpresaId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get("empresa_activa")?.value;
  const eu = await prisma.empresaUsuario.findFirst({
    where: { usuarioId: user.id, activo: true, ...(empresaActivaId ? { empresaId: empresaActivaId } : {}) },
  });
  return eu?.empresaId ?? null;
}

export type EmailState = { success?: boolean; error?: string } | null;

export async function enviarFacturaEmail(_prev: EmailState, formData: FormData): Promise<EmailState> {
  const facturaId = formData.get("id") as string;
  if (!facturaId) return { error: "ID requerido" };

  const empresaId = await getEmpresaId();
  if (!empresaId) return { error: "No autorizado" };

  const factura = await prisma.factura.findFirst({
    where: { id: facturaId, empresaId },
    include: {
      cliente: { select: { nombre: true, email: true } },
      empresa: { select: { nombre: true, email: true } },
    },
  });
  if (!factura) return { error: "Factura no encontrada" };
  if (!factura.cliente.email) return { error: "El cliente no tiene correo electrónico registrado" };

  const to = factura.cliente.email;
  const from = factura.empresa.email || "noreply@contasys.app";
  const subject = `Factura ${factura.numeroFactura} - ${factura.empresa.nombre}`;
  const totalFormatted = Number(factura.total).toLocaleString("en-US", { style: "currency", currency: "USD" });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e3a5f; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">${factura.empresa.nombre}</h1>
      </div>
      <div style="padding: 24px; background: #f8fafc;">
        <p style="font-size: 16px;">Hola <strong>${factura.cliente.nombre}</strong>,</p>
        <p>Tu factura <strong>${factura.numeroFactura}</strong> ha sido emitida por un total de <strong>${totalFormatted}</strong>.</p>
        <p style="color: #64748b; font-size: 14px;">Gracias por tu preferencia.</p>
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

    if (smtpHost && smtpUser) {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({ from, to, subject, html });
    } else if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to, subject, html }),
      });
      if (!res.ok) throw new Error("Error al enviar email vía Resend");
    } else {
      console.log("📧 Email enviado (modo desarrollo):", { to, subject });
    }

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al enviar el email" };
  }
}
