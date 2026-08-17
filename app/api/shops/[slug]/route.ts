// app/api/shops/[slug]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const shop = await prisma.shop.findUnique({
      where: { slug: params.slug },
    });

    if (!shop) {
      return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
    }

    // Récupérer les relations séparément
    const [category, profile, user, reviews] = await Promise.all([
      shop.categoryId ? prisma.shopCategory.findUnique({ where: { id: shop.categoryId } }) : null,
      prisma.shopProfile.findUnique({ where: { shopId: shop.id } }),
      prisma.user.findUnique({ where: { id: shop.userId }, select: { name: true, email: true } }),
      prisma.review.findMany({
        where: { shopId: shop.id },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      ...shop,
      category,
      profile,
      user,
      reviews,
    });
  } catch (error) {
    console.error("API getShop error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement de la boutique" },
      { status: 500 }
    );
  }
}