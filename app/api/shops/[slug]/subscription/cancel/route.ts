// app/api/shops/[slug]/subscription/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const shop = await prisma.shop.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    });
    if (!shop) {
      return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
    }
    if (shop.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Désactiver la vérification
    await prisma.shop.update({
      where: { id: shop.id },
      data: { isVerified: false },
    });

    // Optionnel : enregistrer l'événement d'annulation (par exemple, un log)
    // await prisma.transaction.create({ ... }); // ou un autre système

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur annulation abonnement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}