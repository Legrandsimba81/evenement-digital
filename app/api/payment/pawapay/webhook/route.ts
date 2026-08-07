import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPawaPayPayment } from "@/lib/pawapay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionId, status, reference } = body;

    if (!transactionId || !status) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Vérifier le paiement auprès de PawaPay
    const verification = await verifyPawaPayPayment(transactionId);

    // Trouver la transaction correspondante
    const transaction = await prisma.transaction.findFirst({
      where: { reference },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction introuvable" }, { status: 404 });
    }

    if (verification.status === "completed" && transaction.status !== "completed") {
      // Mettre à jour la transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "completed" },
      });

      // Créditer le solde de l'utilisateur
      await prisma.user.update({
        where: { id: transaction.userId },
        data: { balance: { increment: transaction.amount } },
      });

      // Mettre à jour les limites de l'utilisateur (si le plan est un abonnement ou un événement)
      // Ici, vous pouvez implémenter la logique pour définir les limites selon le plan
      // Exemple : si plan.eventType, définir la limite correspondante dans eventLimits
      // Pour l'instant, on se contente de créditer le solde
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur webhook PawaPay:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}