// app/api/payment/pawapay/initiate/route.ts
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

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur manquant" }, { status: 400 });
    }

    const { plan, operator, phoneNumber, shopSlug } = await request.json();

    if (!plan || !operator || !phoneNumber || !shopSlug) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Vérifier que la boutique existe
    const shop = await prisma.shop.findUnique({
      where: { slug: shopSlug },
      select: { id: true },
    });
    if (!shop) {
      return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
    }

    const reference = `SUB-${Date.now()}-${randomUUID().slice(0, 6)}`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/pawapay/webhook`;

    const payment = await initiatePawaPayPayment({
      amount: plan.price,
      currency: "USD",
      phoneNumber,
      operator,
      reference,
      description: `Abonnement ${plan.name} - ${shopSlug}`, // ✅ On stocke le shopSlug ici
      callbackUrl,
    });

    await prisma.transaction.create({
      data: {
        userId,
        type: "subscription",
        operator,
        phoneNumber,
        amount: plan.price,
        currency: plan.currency || "USD",
        description: `Abonnement ${plan.name} - ${shopSlug}`,
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