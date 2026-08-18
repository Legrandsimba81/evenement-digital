// lib/mail-reservation.ts
import nodemailer from "nodemailer";

// Créer un transporteur seulement si les variables sont définies
const getTransporter = () => {
  if (!process.env.SMTP_HOST) {
    console.warn("⚠️ SMTP non configuré, l'envoi d'emails est désactivé.");
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

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
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Email désactivé] Nouvelle réservation pour ${shopName} de ${clientName}`);
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
    <p><strong>Date souhaitée :</strong> ${new Date(date).toLocaleDateString("fr-FR")}</p>
    <p><strong>Message :</strong> ${message}</p>
    <hr />
    <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/shops/${shopName}/reservations">Voir toutes les réservations</a></p>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });

  console.log(` Email de réservation envoyé à ${to}`);
}