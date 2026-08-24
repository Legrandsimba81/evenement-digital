// app/api/whatsapp/register/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST() {
  try {
    // Vérification de la session Admin
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    // Sécurité : Si WHATSAPP_PIN n'est pas défini dans le .env, on utilise un PIN par défaut
    const pin = process.env.WHATSAPP_PIN || "527352"; 

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        { error: "Variables WhatsApp manquantes" },
        { status: 500 }
      );
    }

    // CORRECTION CRITIQUE : URL officielle corrigée avec le symbole $ et graph.facebook.com
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/register`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        pin: pin,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur d'enregistrement Meta API:", data);
      return NextResponse.json(
        { error: data.error?.message || "Erreur d'enregistrement" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Numéro enregistré avec succès. Le statut devrait passer à Connecté.",
      data,
    });
  } catch (error) {
    console.error("Erreur API register:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}





// curl -X POST "https://graph.facebook.com/v18.0/1162289156975901/register" \
//   -H "Authorization: Bearer EAAeqoHwtUGcBSbGRCTPrLK2diRxZAA35DtMXRqqhsebdxsg8hPZBYpD0BGMvJlw3KnZAdDUkp20hZBtyeXaQjutuQB7YqGjusm5fFfnsWzMxZAuZCp86seCs6gb48G5nwBbso9jDeyCUtd8FGJpoDB23k6o4F0pKZCtzR2NL0bm8aUZAveAbBeb8zr8v8PmhAkBDdgZDZD" \
//   -H "Content-Type: application/json" \
//   -d '{
//     "messaging_product": "whatsapp",
//     "pin": "527352"
//   }'