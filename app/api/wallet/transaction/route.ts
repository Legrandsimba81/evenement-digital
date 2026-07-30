// app/api/wallet/transaction/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { type, amount, description } = await request.json();

  if (!type || !amount || amount <= 0) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true },
  });

  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  // Vérifier le solde pour un retrait
  if (type === "withdraw" && user.balance < amount) {
    return NextResponse.json({ error: "Solde insuffisant" }, { status: 400 });
  }

  const newBalance = type === "deposit" ? user.balance + amount : user.balance - amount;

  // Créer la transaction et mettre à jour le solde (en une transaction Prisma)
  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: session.user.id,
        type,
        amount,
        currency: "USD",
        description: description || (type === "deposit" ? "Dépôt" : "Retrait"),
        status: "completed",
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { balance: newBalance },
    }),
  ]);

  return NextResponse.json({ success: true, message: "Opération réussie", transaction });
}