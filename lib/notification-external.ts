// lib/notification-external.ts
import nodemailer from "nodemailer";

export interface SendGuestInvitationParams {
  phone?: string;
  email?: string;
  guestName: string;
  eventTitle: string;
  invitationLink: string;
}

export async function sendGuestInvitation({
  phone,
  email,
  guestName,
  eventTitle,
  invitationLink,
}: SendGuestInvitationParams) {
  const message = `Bonjour ${guestName},

Cliquez sur le lien ci-dessous pour voir et télécharger le QR CODE de votre invitation pour "${eventTitle}" :

${invitationLink}

Merci et à bientôt !`;

  // Envoi WhatsApp (si disponible)
  if (phone) {
    await sendWhatsAppMessage(phone, message);
  }

  // Envoi email (si disponible)
  if (email) {
    await sendEmail(email, `Invitation pour "${eventTitle}"`, message);
  }
}

// WhatsApp Business API (à adapter selon votre fournisseur)
async function sendWhatsAppMessage(to: string, message: string) {
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!token || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.warn("WhatsApp API non configurée. Message non envoyé.");
    return;
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    });
  } catch (error) {
    console.error("Erreur envoi WhatsApp:", error);
  }
}

// Envoi email via Nodemailer
async function sendEmail(to: string, subject: string, text: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("Erreur envoi email:", error);
  }
}