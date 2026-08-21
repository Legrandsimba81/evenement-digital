// app/api/algolia/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shopsIndex } from "@/lib/algolia";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, shopId } = body;

    if (event === "CREATE" || event === "UPDATE") {
      // Récupérer la boutique mise à jour
      const shop = await prisma.shop.findUnique({
        where: { id: shopId },
        include: {
          category: true,
          profile: true,
          reviews: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      if (!shop) {
        return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
      }

      // Indexer la boutique
      await shopsIndex.saveObject({
        objectID: shop.id,
        name: shop.name,
        slug: shop.slug,
        description: shop.description || "",
        city: shop.city || "",
        province: shop.province || "",
        address: shop.address || "",
        phone: shop.phone || "",
        whatsapp: shop.whatsapp || "",
        website: shop.website || "",
        coverImage: shop.coverImage || "",
        logo: shop.logo || "",
        isVerified: shop.isVerified,
        isActive: shop.isActive,
        priceRange: shop.profile?.priceRange || "Prix sur demande",
        tags: shop.profile?.tags || [],
        category: shop.category
          ? { id: shop.category.id, name: shop.category.name }
          : null,
        user: shop.user
          ? { id: shop.user.id, name: shop.user.name }
          : null,
        averageRating: shop.reviews.length
          ? shop.reviews.reduce((acc, r) => acc + r.rating, 0) / shop.reviews.length
          : 0,
        reviewCount: shop.reviews.length,
        createdAt: shop.createdAt.getTime(),
      });
    }

    if (event === "DELETE") {
      await shopsIndex.deleteObject(shopId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur webhook Algolia:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}