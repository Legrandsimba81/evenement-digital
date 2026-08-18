import { NextRequest, NextResponse } from "next/server";
import { createReservation } from "@/actions/shop-actions";

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { date, message } = body;
    if (!date) {
      return NextResponse.json(
        { error: "La date est requise." },
        { status: 400 }
      );
    }
    const result = await createReservation(params.slug, { date, message });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur interne" },
      { status: 500 }
    );
  }
}