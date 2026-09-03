import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  
  // Si token manquant, afficher une page d'erreur
  if (!token) {
    return new NextResponse(
      generateErrorPage("Token manquant", "Le lien de scan est incomplet."),
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  // Récupérer l'événement
  const event = await prisma.event.findFirst({
    where: { unlistedQrToken: token },
    select: {
      id: true,
      title: true,
      unlistedGuestsLimit: true,
      unlistedGuestsCount: true,
      isPaid: true,
    },
  });

  // Cas : QR invalide
  if (!event) {
    return new NextResponse(
      generateErrorPage("QR invalide", "Ce code QR n'est pas reconnu."),
      { status: 404, headers: { "Content-Type": "text/html" } }
    );
  }

  // Cas : événement non payant
  if (!event.isPaid) {
    return new NextResponse(
      generateErrorPage("Fonctionnalité non disponible", "Cet événement n'est pas configuré pour les invités hors liste."),
      { status: 403, headers: { "Content-Type": "text/html" } }
    );
  }

  // Cas : limite atteinte
  if (event.unlistedGuestsLimit !== null && event.unlistedGuestsCount >= event.unlistedGuestsLimit) {
    return new NextResponse(
      generateErrorPage(
        "Nombre maximum d'entrées atteint",
        `La limite de ${event.unlistedGuestsLimit} entrées a été atteinte.`
      ),
      { status: 403, headers: { "Content-Type": "text/html" } }
    );
  }

  // Tout est bon : incrémenter le compteur
  const updated = await prisma.event.update({
    where: { id: event.id },
    data: { unlistedGuestsCount: { increment: 1 } },
    select: { unlistedGuestsCount: true, unlistedGuestsLimit: true },
  });

  // Retourner une page de succès
  const successHtml = generateSuccessPage(
    event.title,
    updated.unlistedGuestsCount,
    updated.unlistedGuestsLimit
  );

  return new NextResponse(successHtml, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

// ---------- Fonctions de génération HTML ----------

function generateErrorPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Erreur - Scan invité</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #f3f4f6;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .card {
      max-width: 500px;
      width: 100%;
      background: white;
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      text-align: center;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }
    p {
      color: #6b7280;
      font-size: 1rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #3b82f6;
      color: white;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.2s;
    }
    .btn:hover { background: #2563eb; }
    .error .icon { color: #ef4444; }
    .error h1 { color: #dc2626; }
  </style>
</head>
<body>
  <div class="card error">
    <div class="icon">❌</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/" class="btn">Retour à l'accueil</a>
  </div>
</body>
</html>`;
}

function generateSuccessPage(eventTitle: string, count: number, limit: number | null): string {
  const remaining = limit !== null ? limit - count : "illimitée";
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Entrée validée - Scan invité</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #f3f4f6;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .card {
      max-width: 500px;
      width: 100%;
      background: white;
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      text-align: center;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: #6b7280;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
    .badge {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 1.2rem;
      margin: 1rem 0;
    }
    .info {
      color: #4b5563;
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
    }
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #3b82f6;
      color: white;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.2s;
    }
    .btn:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>Entrée enregistrée</h1>
    <p class="subtitle">pour <strong>${eventTitle}</strong></p>
    <div class="badge">${count} / ${limit !== null ? limit : "∞"}</div>
    <p class="info">Il reste ${remaining} entrée(s) disponibles.</p>
    <a href="/" class="btn">Retour à l'accueil</a>
  </div>
</body>
</html>`;
}