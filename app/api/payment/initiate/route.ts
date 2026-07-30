import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    const { plan, operator, phoneNumber, proofImage, countryCode, fullName } = await request.json();

    // Validation
    if (!plan || !operator || !phoneNumber || !proofImage || !countryCode || !fullName) {
      return NextResponse.json(
        { error: "Tous les champs sont requis : plan, operator, phoneNumber, proofImage, countryCode, fullName" },
        { status: 400 }
      );
    }

    // Création de la transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: "deposit",
        operator,
        countryCode,
        phoneNumber,
        fullName,
        amount: Number(plan.price),
        currency: plan.currency || "USD",
        description: `Dépôt pour ${plan.name}`,
        proofImage,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      message: "Transaction enregistrée en attente de validation.",
    });
  } catch (error) {
    console.error("Erreur API payment/initiate:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'enregistrement du paiement." },
      { status: 500 }
    );
  }
}