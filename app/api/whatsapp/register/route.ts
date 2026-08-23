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
    // OPTIMISATION : Stocker le PIN dans le fichier .env (ex: WHATSAPP_PIN=527352)
    const pin = process.env.WHATSAPP_PIN; 

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        { error: "Variables WhatsApp manquantes" },
        { status: 500 }
      );
    }

    // CORRECTION : Passage à la v20.0 (la v18.0 arrive en fin de vie) [1]
    const response = await fetch(
      `https://facebook.com{phoneNumberId}/register`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          pin: pin,
        }),
      }
    );

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
