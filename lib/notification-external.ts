import nodemailer from "nodemailer";
import { formatPhoneNumber, cleanPhoneNumber } from "@/lib/utils";

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
  
  // Le message brut reste utilisé pour l'email
  const textMessage = `Bonjour ${guestName},\n\nCliquez sur le lien ci-dessous pour voir et télécharger le QR CODE de votre invitation pour "${eventTitle}" :\n\n${invitationLink}\n\nMerci et à bientôt !`;

  let success = false;
  const errors: string[] = [];

  if (phone) {
    const formattedPhone = formatPhoneNumber(phone);
    try {
      // OPTIMISATION : On passe les variables séparées à la fonction WhatsApp
      await sendWhatsAppTemplate(phone, guestName, eventTitle, invitationLink);
      success = true;
      console.log(`✅ WhatsApp envoyé à ${formattedPhone}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      errors.push(`WhatsApp (${formattedPhone}): ${msg}`);
      console.error(`❌ Erreur WhatsApp ${formattedPhone}:`, error);
    }
  }

  if (email) {
    try {
      await sendEmail(email, `Invitation pour "${eventTitle}"`, textMessage);
      success = true;
      console.log(`✅ Email envoyé à ${email}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      errors.push(`Email (${email}): ${msg}`);
      console.error(`❌ Erreur Email ${email}:`, error);
    }
  }

  if (!success) {
    throw new Error(`Échec de l'envoi: ${errors.join('; ')}`);
  }

  return { success, errors };
}

// WhatsApp Business API structurée pour les messages automatiques initiés par le site
async function sendWhatsAppTemplate(to: string, guestName: string, eventTitle: string, invitationLink: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  // Optionnel : Récupérer le nom du template via l'environnement, sinon valeur par défaut
  const templateName = process.env.WHATSAPP_INVITATION_TEMPLATE_NAME || "guest_invitation";

  if (!phoneNumberId || !accessToken) {
    throw new Error("WhatsApp API non configurée (jetons manquants)");
  }

  const cleaned = cleanPhoneNumber(to);
  const formattedTo = cleaned.startsWith('0') ? '243' + cleaned.slice(1) : cleaned;

  // CORRECTION : Passage à la v20.0
  const url = `https://facebook.com{phoneNumberId}/messages`;

  // CORRECTION CRITIQUE : Payload structuré selon les exigences de Meta pour les templates
  const payload = {
    messaging_product: "whatsapp",
    to: formattedTo,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: "fr" // Assurez-vous que votre template Meta est créé en Français
      },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: guestName },       // Remplace {{1}}
            { type: "text", text: eventTitle },      // Remplace {{2}}
            { type: "text", text: invitationLink }   // Remplace {{3}}
          ]
        }
      ]
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Erreur WhatsApp API:", data);
    throw new Error(data.error?.message || "Erreur d'envoi WhatsApp");
  }

  return data;
}

// Envoi email inchangé et fonctionnel
async function sendEmail(to: string, subject: string, text: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
}
