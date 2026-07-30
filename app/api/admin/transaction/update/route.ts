import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
    });

    // Si le statut devient "completed", ajouter le montant au solde de l'utilisateur
    if (status === "completed") {
      await prisma.user.update({
        where: { id: transaction.userId },
        data: { balance: { increment: transaction.amount } },
      });
    }

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}