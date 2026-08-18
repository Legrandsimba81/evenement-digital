import { NextRequest, NextResponse } from "next/server";
import { addPortfolioImage, removePortfolioImage } from "@/actions/shop-actions";

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl est requis." },
        { status: 400 }
      );
    }
    const result = await addPortfolioImage(params.slug, imageUrl);
    return NextResponse.json(result);
  } catch (error: any) {
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
    const { imageUrl } = await request.json();
    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl est requis." },
        { status: 400 }
      );
    }
    const result = await removePortfolioImage(params.slug, imageUrl);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur interne" },
      { status: 500 }
    );
  }
}