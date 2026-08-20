// lib/mail-collabo.ts
import nodemailer from "nodemailer";

// Configuration du transporteur (identique à mail-reservation)
const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.EMAIL_PORT || "587");
  const secure = process.env.EMAIL_SECURE === "true";

  if (!user || !pass) {
    console.warn("⚠️ [Email] Variables EMAIL_USER ou EMAIL_PASS manquantes. L'envoi d'emails est désactivé.");
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
    console.log(`✅ [Email] Transporteur SMTP configuré (${host}:${port})`);
    return transporter;
  } catch (error) {
    console.error("❌ [Email] Erreur de configuration du transporteur :", error);
    return null;
  }
};

/**
 * Envoie un email à un utilisateur pour l'informer qu'il a été ajouté comme collaborateur.
 */
export async function sendCollaboratorAddedEmail({
  to,
  collaboratorName,
  eventTitle,
  ownerName,
  eventSlug,
}: {
  to: string;
  collaboratorName: string;
  eventTitle: string;
  ownerName: string;
  eventSlug: string;
}) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Email désactivé] Ajout collaborateur pour ${collaboratorName} sur ${eventTitle}`);
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://evenement-digital.vercel.app";
  const dashboardLink = `${baseUrl}/dashboard/${eventSlug}`;

  const subject = `Vous avez été ajouté comme collaborateur sur "${eventTitle}"`;
  const html = `
    <h2>👥 Collaboration sur Octavia Event</h2>
    <p>Bonjour <strong>${collaboratorName}</strong>,</p>
    <p><strong>${ownerName}</strong> vous a ajouté comme collaborateur sur l'événement <strong>"${eventTitle}"</strong>.</p>
    <p>En tant que collaborateur, vous pouvez :</p>
    <ul>
      <li>✅ Gérer les invités</li>
      <li>✅ Modifier les informations de l'événement</li>
      <li>✅ Voir les messages des invités</li>
    </ul>
    <p>
      <a href="${dashboardLink}" style="display:inline-block;padding:10px 20px;background:#5F62E2;color:white;border-radius:8px;text-decoration:none;">
        Accéder à l'événement
      </a>
    </p>
    <hr />
    <p style="font-size:12px;color:#888;">Cet email a été envoyé automatiquement depuis Octavia Event.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });

  console.log(`✅ [Email] Collaborateur ajouté : ${to} pour ${eventTitle}`);
}

/**
 * Envoie un email à un utilisateur pour l'informer qu'il a été retiré des collaborateurs.
 */
export async function sendCollaboratorRemovedEmail({
  to,
  collaboratorName,
  eventTitle,
  ownerName,
}: {
  to: string;
  collaboratorName: string;
  eventTitle: string;
  ownerName: string;
}) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Email désactivé] Retrait collaborateur pour ${collaboratorName} sur ${eventTitle}`);
    return;
  }

  const subject = `Vous avez été retiré des collaborateurs de "${eventTitle}"`;
  const html = `
    <h2>Collaboration sur Octavia Event</h2>
    <p>Bonjour <strong>${collaboratorName}</strong>,</p>
    <p><strong>${ownerName}</strong> vous a retiré des collaborateurs de l'événement <strong>"${eventTitle}"</strong>.</p>
    <p>Vous n'avez donc plus accès à la gestion de cet événement.</p>
    <p>Si vous pensez qu'il s'agit d'une erreur, contactez ${ownerName} directement.</p>
    <hr />
    <p style="font-size:12px;color:#888;">Cet email a été envoyé automatiquement depuis Octavia Event.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });

  console.log(`✅ [Email] Collaborateur retiré : ${to} de ${eventTitle}`);
}