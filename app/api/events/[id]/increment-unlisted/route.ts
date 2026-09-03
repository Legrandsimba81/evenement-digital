// app/api/events/[eventId]/increment-unlisted/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Token requis" }, { status: 400 });
    }

    const event = await prisma.event.findFirst({
      where: {
        id: params.eventId,
        unlistedQrToken: token,
      },
      select: {
        id: true,
        unlistedGuestsLimit: true,
        unlistedGuestsCount: true,
        isPaid: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Token invalide" }, { status: 404 });
    }
    if (!event.isPaid) {
      return NextResponse.json({ error: "Fonctionnalité non disponible" }, { status: 403 });
    }
    if (event.unlistedGuestsLimit !== null && event.unlistedGuestsCount >= event.unlistedGuestsLimit) {
      return NextResponse.json({ error: "Limite d'entrées atteinte" }, { status: 403 });
    }

    const updated = await prisma.event.update({
      where: { id: event.id },
      data: { unlistedGuestsCount: { increment: 1 } },
      select: { unlistedGuestsCount: true },
    });

    return NextResponse.json({
      success: true,
      newCount: updated.unlistedGuestsCount,
    });
  } catch (error) {
    console.error("Erreur increment-unlisted:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}