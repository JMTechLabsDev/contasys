import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyWebhook, getPayPalAccessToken } from "@/lib/paypal/client";

const PAYPAL_API = process.env.SRI_AMBIENTE === "produccion"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function verify(headers: Headers, body: string): Promise<boolean> {
  const token = await getPayPalAccessToken();
  const response = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo") ?? "",
      cert_url: headers.get("paypal-cert-url") ?? "",
      transmission_id: headers.get("paypal-transmission-id") ?? "",
      transmission_sig: headers.get("paypal-transmission-sig") ?? "",
      transmission_time: headers.get("paypal-transmission-time") ?? "",
      webhook_id: process.env.PAYPAL_WEBHOOK_ID ?? "",
      webhook_event: JSON.parse(body),
    }),
  });
  const data = await response.json();
  return data.verification_status === "SUCCESS";
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  try {
    if (process.env.PAYPAL_WEBHOOK_ID) {
      const isValid = await verify(req.headers, body);
      if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const event = JSON.parse(body);

  try {
    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED": {
        const transactionId = event.resource.id;
        const monto = parseFloat(event.resource.amount?.value ?? "0");
        await prisma.pagoSuscripcion.updateMany({
          where: { paypalTransactionId: transactionId },
          data: { estado: "completado" },
        });
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED": {
        const subId = event.resource.id;
        await prisma.suscripcion.updateMany({
          where: { paypalSubscriptionId: subId },
          data: { estado: "cancelada" },
        });
        break;
      }

      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const subId = event.resource.id;
        await prisma.suscripcion.updateMany({
          where: { paypalSubscriptionId: subId },
          data: { estado: "vencida" },
        });
        break;
      }

      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
        const subId = event.resource.id;
        await prisma.suscripcion.updateMany({
          where: { paypalSubscriptionId: subId },
          data: { estado: "vencida" },
        });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook error:", err);
  }

  return NextResponse.json({ received: true });
}
