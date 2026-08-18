// app/api/admin/shops/[slug]/certify/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> } // ✅ ajouter Promise
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { certified } = await request.json();
    if (typeof certified !== "boolean") {
      return NextResponse.json({ error: "Le champ 'certified' doit être un booléen" }, { status: 400 });
    }

    // ✅ Résoudre la promesse params
    const { slug } = await params;

    const shop = await prisma.shop.update({
      where: { slug },
      data: { isVerified: certified },
      select: { id: true, name: true, isVerified: true },
    });

    return NextResponse.json({ success: true, shop });
  } catch (error) {
    console.error("Erreur certification:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}