// app/api/whatsapp/test/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // "templateName" est ajouté pour permettre l'envoi du message d'initiation requis par Meta
    const { to, message, templateName } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: "Numéro de téléphone requis" },
        { status: 400 }
      );
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        { error: "WhatsApp non configuré" },
        { status: 500 }
      );
    }

    // CORRECTION : Déterminer le corps de la requête selon les règles de Meta
    // Si aucun message client n'a eu lieu dans les dernières 24h, vous DEVEZ utiliser un template.
    let payload: any = {
      messaging_product: "whatsapp",
      to: to,
    };

    if (templateName) {
      // Obligatoire pour initier une conversation
      payload.type = "template";
      payload.template = {
        name: templateName, // ex: "hello_world"
        language: { code: "en_US" } // Ajustez la langue selon votre template
      };
    } else {
      // Valide uniquement si le client vous a écrit en premier (fenêtre de 24h)
      if (!message) {
        return NextResponse.json({ error: "Message requis pour le mode texte" }, { status: 400 });
      }
      payload.type = "text";
      payload.text = { body: message };
    }

    // CORRECTION : Passage à la version v20.0 de l'API Graph
    const response = await fetch(
      `https://facebook.com{phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur envoi WhatsApp API:", data);
      return NextResponse.json(
        { error: data.error?.message || "Erreur d'envoi" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data.messages?.[0]?.id,
      data,
    });
  } catch (error) {
    console.error("Erreur test WhatsApp:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
