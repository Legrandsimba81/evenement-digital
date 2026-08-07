import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { initiatePawaPayPayment } from "@/lib/pawapay";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // ✅ Vérifier que l'ID utilisateur est bien présent
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur manquant" }, { status: 400 });
    }

    const { plan, operator, phoneNumber } = await request.json();

    if (!plan || !operator || !phoneNumber) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Générer une référence unique
    const reference = `OCT-${Date.now()}-${randomUUID().slice(0, 6)}`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/pawapay/webhook`;

    // Initier le paiement via PawaPay
    const payment = await initiatePawaPayPayment({
      amount: plan.price,
      currency: "USD",
      phoneNumber,
      operator,
      reference,
      description: `Paiement pour ${plan.name}`,
      callbackUrl,
    });

    // Créer une transaction en base
    await prisma.transaction.create({
      data: {
        userId, // ✅ maintenant c'est une string non undefined
        type: "deposit",
        operator,
        phoneNumber,
        amount: plan.price,
        currency: plan.currency || "USD",
        description: `Paiement pour ${plan.name}`,
        status: "pending",
        provider: "pawapay",
        reference: payment.reference,
      },
    });

    return NextResponse.json({
      success: true,
      reference: payment.reference,
      transactionId: payment.transactionId,
    });
  } catch (error: any) {
    console.error("Erreur initiation PawaPay:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}