import { NextResponse } from "next/server";
import { getShop } from "@/actions/shop-actions";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const shop = await getShop(params.slug);
    if (!shop) {
      return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
    }
    return NextResponse.json(shop);
  } catch (error) {
    console.error("Erreur API shops/[slug]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}