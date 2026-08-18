// lib/email-reservation.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
}