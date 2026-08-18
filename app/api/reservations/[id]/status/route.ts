// app/api/reservations/[id]/status/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const formData = await req.formData();
    const status = formData.get("status") as string;
    if (!["pending", "accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { shop: { include: { user: true } } },
    });
    if (!reservation) {
      return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 });
    }

    // Vérifier que l'utilisateur est le propriétaire ou admin
    if (reservation.shop.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await prisma.reservation.update({
      where: { id },
      data: { status },
    });

    // Optionnel : envoyer un email au client pour notifier le changement
    // ...

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur mise à jour statut:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}