// app/api/faire-part/share/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { eventId, fairePartUrl } = body;

    if (!eventId && !fairePartUrl) {
      return NextResponse.json(
        { error: "eventId ou fairePartUrl requis" },
        { status: 400 }
      );
    }

    // Vous pouvez ajouter ici des vérifications supplémentaires (accès à l'événement, etc.)

    const shareUrl = fairePartUrl || `${process.env.NEXT_PUBLIC_APP_URL}/invitation/${eventId}`;

    return NextResponse.json({ shareUrl });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}