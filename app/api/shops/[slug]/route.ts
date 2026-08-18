import { NextRequest, NextResponse } from "next/server";
import { getShopBySlug, updateShop, deleteShop } from "@/actions/shop-actions";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const shop = await getShopBySlug(params.slug);
    if (!shop) {
      return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
    }
    return NextResponse.json(shop);
  } catch (error) {
    console.error("GET /api/shops/[slug] error:", error);
    return NextResponse.json(
      { error: "Erreur interne" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const result = await updateShop(params.slug, body);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Erreur interne" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const result = await deleteShop(params.slug);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur interne" },
      { status: 500 }
    );
  }
}