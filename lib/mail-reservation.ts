// lib/mail-reservation.ts
import nodemailer from "nodemailer";

/**
 * Crée un transporteur SMTP à partir des variables d'environnement.
 * Utilise les variables EMAIL_* (compatibles avec votre configuration).
 */
const getTransporter = () => {
  // 🔐 Vérifier que les variables essentielles sont définies
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.EMAIL_PORT || "587");
  const secure = process.env.EMAIL_SECURE === "true"; // false pour 587, true pour 465

  if (!user || !pass) {
    console.warn("⚠️ [Email] Variables EMAIL_USER ou EMAIL_PASS manquantes. L'envoi d'emails est désactivé.");
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      // Pour Gmail, on peut ajouter ces options pour éviter les problèmes
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log(`✅ [Email] Transporteur SMTP configuré (${host}:${port})`);
    return transporter;
  } catch (error) {
    console.error("❌ [Email] Erreur de configuration du transporteur :", error);
    return null;
  }
};

/**
 * Envoie un email de confirmation de réservation au propriétaire de la boutique.
 */
export async function sendReservationEmail({
  to,
  shopName,
  clientName,
  clientEmail,
  clientPhone,
  clientWhatsapp,
  date,
  message,
  reservationId,
}: {
  to: string;
  shopName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientWhatsapp: string;
  date: string;
  message: string;
  reservationId: string;
}) {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.log(`📧 [Email désactivé] Réservation pour ${shopName} - ${clientName}`);
      return;
    }

    const subject = `Nouvelle réservation pour ${shopName}`;
    const html = `
      <h2>Nouvelle demande de réservation</h2>
      <p><strong>Boutique :</strong> ${shopName}</p>
      <p><strong>Client :</strong> ${clientName}</p>
      <p><strong>Email :</strong> <a href="mailto:${clientEmail}">${clientEmail}</a></p>
      <p><strong>Téléphone :</strong> ${clientPhone}</p>
      <p><strong>WhatsApp :</strong> ${clientWhatsapp}</p>
      <p><strong>Date souhaitée :</strong> ${new Date(date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}</p>
      <p><strong>Message :</strong> ${message || "Aucun message"}</p>
      <hr />
      <p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/shops/${encodeURIComponent(shopName)}/reservations">
          Voir toutes les réservations
        </a>
      </p>
      <p>Référence : #${reservationId.slice(0, 8)}</p>
      <p style="font-size: 12px; color: #888;">Cet email a été envoyé automatiquement depuis Octavia Event.</p>
    `;

    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log(`✅ [Email] Réservation envoyée à ${to} pour ${shopName}`);
  } catch (error) {
    console.error("❌ [Email] Erreur lors de l'envoi :", error);
    // On ne relance pas l'erreur pour ne pas bloquer la réservation
  }
}