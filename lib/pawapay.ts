// lib/pawapay.ts
import { randomUUID } from "crypto";

const API_BASE = process.env.PAWAPAY_BASE_URL!;
const API_KEY = process.env.PAWAPAY_API_KEY!;
const API_SECRET = process.env.PAWAPAY_API_SECRET!;

export interface PawaPayPaymentRequest {
  amount: number;
  currency: "USD";
  phoneNumber: string; // format +243XXXXXXXXX
  operator: "airtel" | "orange" | "vodacom";
  reference: string; // votre référence interne
  description: string;
  callbackUrl: string;
}

export interface PawaPayPaymentResponse {
  status: "pending" | "success" | "failed";
  transactionId: string;
  reference: string;
  payUrl?: string;
}

export async function initiatePawaPayPayment(
  data: PawaPayPaymentRequest
): Promise<PawaPayPaymentResponse> {
  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");

  const payload = {
    amount: data.amount,
    currency: data.currency,
    phone: data.phoneNumber,
    operator: data.operator,
    reference: data.reference,
    description: data.description,
    callback_url: data.callbackUrl,
  };

  const res = await fetch(`${API_BASE}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`PawaPay error: ${error}`);
  }

  const json = await res.json();
  return {
    status: json.status,
    transactionId: json.id,
    reference: json.reference,
    payUrl: json.pay_url,
  };
}

export async function verifyPawaPayPayment(transactionId: string): Promise<{ status: string; amount: number }> {
  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");

  const res = await fetch(`${API_BASE}/payments/${transactionId}`, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la vérification du paiement");
  }

  const json = await res.json();
  return { status: json.status, amount: json.amount };
}