// app/api/payment/pawapay/webhook/route.ts
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

      // ✅ Activer la vérification de la boutique si le paiement est un abonnement
      if (transaction.type === "subscription") {
        // Extraire le shopSlug depuis la description
        // Format attendu : "Abonnement Essentiel - ma-boutique"
        const match = transaction.description?.match(/-\s*([a-zA-Z0-9-]+)$/);
        const shopSlug = match ? match[1] : null;

        if (shopSlug) {
          await prisma.shop.update({
            where: { slug: shopSlug },
            data: { isVerified: true },
          });
          console.log(`✅ Boutique "${shopSlug}" vérifiée suite au paiement de l'abonnement.`);
        } else {
          console.warn(`⚠️ Impossible d'extraire le shopSlug de la description: ${transaction.description}`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur webhook PawaPay:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}