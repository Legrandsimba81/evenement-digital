// app/api/events/[id]/reset-unlisted/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageEvent } from "@/lib/permissions";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: eventId } = await params; // ✅ résoudre la promesse

    const hasAccess = await canManageEvent(eventId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { isPaid: true },
    });
    if (!event || !event.isPaid) {
      return NextResponse.json({ error: "Fonctionnalité non disponible" }, { status: 403 });
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: { unlistedGuestsCount: 0 },
      select: { unlistedGuestsCount: true },
    });

    return NextResponse.json({ count: updated.unlistedGuestsCount });
  } catch (error) {
    console.error("Erreur reset-unlisted:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}