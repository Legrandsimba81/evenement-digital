import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { guestId, secret } = await req.json();

    if (!guestId || !secret) {
      return NextResponse.json(
        { success: false, message: "Paramètres manquants." },
        { status: 400 }
      );
    }

    // Récupérer l'invité avec son événement
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { event: true },
    });

    if (!guest) {
      return NextResponse.json(
        { success: false, message: "Invité non trouvé." },
        { status: 404 }
      );
    }

    // Vérifier le secret
    if (guest.event.gateSecret !== secret) {
      return NextResponse.json(
        { success: false, message: "Jeton invalide." },
        { status: 403 }
      );
    }

    // Vérifier que l'invité n'est pas déjà entré
    if (guest.status === "entre") {
      return NextResponse.json(
        { success: false, message: "Cet invité est déjà entré." },
        { status: 400 }
      );
    }

    // Mettre à jour le statut
    await prisma.guest.update({
      where: { id: guestId },
      data: { status: "entre" },
    });

    return NextResponse.json({
      success: true,
      message: `Bienvenue ${guest.firstName} ${guest.lastName} !`,
    });
  } catch (error) {
    console.error("Erreur /api/gate/verify:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 }
    );
  }
}