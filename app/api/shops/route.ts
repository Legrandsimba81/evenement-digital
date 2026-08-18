import { NextRequest, NextResponse } from "next/server";
import { getShops, createShop } from "@/actions/shop-actions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get("category") || undefined;
  const city = searchParams.get("city") || undefined;
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);

  try {
    const result = await getShops({ categoryId, city, search, page, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/shops error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des boutiques." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createShop(body);
    return NextResponse.json(result, { status: 201 });
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