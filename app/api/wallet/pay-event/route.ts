// app/api/wallet/pay-event/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { eventId, amount } = await request.json();

  if (!eventId || !amount || amount <= 0) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true },
  });

  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  if (user.balance < amount) {
    return NextResponse.json({ error: "Solde insuffisant" }, { status: 400 });
  }

  // Vérifier que l'événement appartient à l'utilisateur
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { userId: true },
  });

  if (!event || event.userId !== session.user.id) {
    return NextResponse.json({ error: "Événement non trouvé ou non autorisé" }, { status: 404 });
  }

  const newBalance = user.balance - amount;

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: "payment",
        amount,
        currency: "USD",
        description: `Paiement pour l'événement ${eventId}`,
        status: "completed",
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { balance: newBalance },
    }),
  ]);

  return NextResponse.json({ success: true, message: "Paiement effectué" });
}