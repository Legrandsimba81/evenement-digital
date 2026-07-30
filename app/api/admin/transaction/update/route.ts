// app/api/admin/transaction/update/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { notifyDepositValidated, notifyDepositRejected } from "@/lib/notifications";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { transactionId, status } = await request.json();

  if (!transactionId || !status) {
    return NextResponse.json({ error: "Données incomplètes" }, { status: 400 });
  }

  try {
    // Mise à jour avec sélection des champs nécessaires pour les notifications
    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
      select: {
        userId: true,
        amount: true,
        currency: true,
      },
    });

    // Si la transaction est validée, créditer le solde et notifier
    if (status === "completed") {
      await prisma.user.update({
        where: { id: updated.userId },
        data: { balance: { increment: updated.amount } },
      });
      await notifyDepositValidated(updated.userId, updated.amount, updated.currency);
    } else if (status === "failed") {
      await notifyDepositRejected(updated.userId, updated.amount, updated.currency);
    }

    // Récupérer la transaction complète pour la réponse (optionnel mais utile pour le frontend)
    const fullTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    return NextResponse.json({ success: true, transaction: fullTransaction });
  } catch (error) {
    console.error("Erreur mise à jour transaction:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}