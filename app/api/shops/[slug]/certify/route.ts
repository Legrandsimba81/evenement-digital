import { NextRequest, NextResponse } from "next/server";
import { certifyShop } from "@/actions/shop-actions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { certified } = await request.json();
    if (typeof certified !== "boolean") {
      return NextResponse.json(
        { error: "Le champ 'certified' est requis et doit être un booléen." },
        { status: 400 }
      );
    }
    const result = await certifyShop(params.slug, certified);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur interne" },
      { status: 500 }
    );
  }
}