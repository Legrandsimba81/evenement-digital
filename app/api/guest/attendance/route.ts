import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { eventId, guestName, status } = await req.json();

    // Séparer prénom et nom
    const nameParts = guestName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const guest = await prisma.guest.findFirst({
      where: {
        eventId,
        firstName: firstName,
        lastName: lastName,
      },
    });

    if (!guest) {
      return NextResponse.json({ error: "Invité non trouvé" }, { status: 404 });
    }

    await prisma.guest.update({
      where: { id: guest.id },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur mise à jour statut:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}