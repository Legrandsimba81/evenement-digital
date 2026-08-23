// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

// Vérification du webhook (GET)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    // CORRECTION CRITIQUE : Meta exige une réponse au format texte brut strict
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// Réception des messages (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // OPTIMISATION : Ignorer les notifications vides ou de statut pour éviter de saturer vos logs
    if (!body.object || !body.entry?.[0]?.changes?.[0]?.value) {
      return NextResponse.json({ success: true });
    }

    const value = body.entry[0].changes[0].value;

    // Exemple de structure pour extraire le message reçu
    if (value.messages?.[0]) {
      const message = value.messages[0];
      const from = message.from; // Numéro du client
      
      console.log(`Message reçu de ${from}:`, message.text?.body || "[Autre type]");
      
      // Ajoutez ici votre logique métier :
      // - Sauvegarde en base de données
      // - Déclenchement d'un bot
    }

    // Toujours renvoyer un statut 200 à Meta pour accuser réception
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erreur webhook:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
