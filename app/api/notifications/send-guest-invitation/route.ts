// app/api/notifications/send-guest-invitation/route.ts
import { NextResponse } from "next/server";
import { sendGuestInvitation } from "@/lib/notification-external";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, email, guestName, eventTitle, invitationLink } = body;

    if (!guestName || !eventTitle || !invitationLink) {
      return NextResponse.json(
        { error: "Paramètres manquants : guestName, eventTitle, invitationLink sont requis." },
        { status: 400 }
      );
    }

    // Appel de la fonction d'envoi
    await sendGuestInvitation({
      phone,
      email,
      guestName,
      eventTitle,
      invitationLink,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur API invitation:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}