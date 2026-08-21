// actions/contact-actions.ts
"use server";

import { z } from "zod";
import { auth } from "@/auth";
import nodemailer from "nodemailer";

const ContactSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().regex(/^0\d{9}$/, "Téléphone invalide (10 chiffres, commence par 0)"),
  subject: z.string().min(1, "Sujet requis"),
  message: z.string().min(10, "Message trop court (minimum 10 caractères)"),
});

export async function sendContactMessage(data: any) {
  try {
    const validated = ContactSchema.parse(data);
    const session = await auth();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER || process.env.SMTP_USER,
        pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
      },
    });

    // Email professionnel (sans émojis)
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; }
            h2 { color: #5F62E2; border-bottom: 2px solid #5F62E2; padding-bottom: 10px; }
            .info { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .label { font-weight: bold; color: #555; }
            .message-box { background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #5F62E2; }
            .footer { margin-top: 30px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 15px; }
          </style>
        </head>
        <body>
          <h2>Nouveau message de contact</h2>
          <div class="info">
            <p><span class="label">Nom :</span> ${validated.name}</p>
            <p><span class="label">Email :</span> <a href="mailto:${validated.email}">${validated.email}</a></p>
            <p><span class="label">Telephone :</span> ${validated.phone}</p>
            <p><span class="label">Sujet :</span> ${validated.subject}</p>
            ${session?.user ? `<p><span class="label">Utilisateur connecte :</span> ${session.user.email} (ID: ${session.user.id})</p>` : ''}
          </div>
          <div class="message-box">
            <p style="white-space: pre-wrap;">${validated.message}</p>
          </div>
          <div class="footer">
            <p>Message envoye depuis le formulaire de contact Octavia Event</p>
            <p>${new Date().toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </body>
      </html>
    `;

    // Envoyer à l'équipe
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: "legrandsimba81@gmail.com",
      subject: `[Octavia Event] ${validated.subject}`,
      html,
      replyTo: validated.email,
    });

    // Confirmation utilisateur
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: validated.email,
      subject: "Confirmation de votre message - Octavia Event",
      html: `
        <h2>Message recu</h2>
        <p>Bonjour <strong>${validated.name}</strong>,</p>
        <p>Nous avons bien reçu votre message concernant "<strong>${validated.subject}</strong>".</p>
        <p>Nous vous repondrons dans les plus brefs delais.</p>
        <hr />
        <p style="font-size: 12px; color: #888;">Octavia Event - L'organisation d'evenements simplifiee</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur envoi contact:", error);
    
    // CORRECTION : Remplacement de .errors par .issues pour Zod v3+
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((issue) => issue.message).join(", ");
      throw new Error(messages);
    }
    
    throw new Error("Erreur lors de l'envoi du message. Veuillez réessayer.");
  }
}
