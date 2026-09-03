// app/api/events/[id]/update-limit/route.ts
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

    const { id: eventId } = await params;
    const hasAccess = await canManageEvent(eventId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { limit } = body;
    if (limit !== undefined && (typeof limit !== "number" || limit < 0)) {
      return NextResponse.json({ error: "Limite invalide" }, { status: 400 });
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: { unlistedGuestsLimit: limit },
      select: { unlistedGuestsLimit: true },
    });

    return NextResponse.json({ limit: updated.unlistedGuestsLimit });
  } catch (error) {
    console.error("Erreur update-limit:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}