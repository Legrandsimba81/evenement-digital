import { NextRequest, NextResponse } from "next/server";
import { toggleShopActive } from "@/actions/shop-actions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { isActive } = await request.json();
    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "Le champ 'isActive' est requis et doit être un booléen." },
        { status: 400 }
      );
    }
    const result = await toggleShopActive(params.slug, isActive);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur interne" },
      { status: 500 }
    );
  }
}