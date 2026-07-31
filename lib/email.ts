// lib/email.ts
import nodemailer from "nodemailer";

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM) {
  console.error("❌ Variables EMAIL_USER, EMAIL_PASS ou EMAIL_FROM manquantes.");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
  logger: true,
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Erreur de connexion SMTP :", error);
  } else {
    console.log("✅ SMTP prêt");
  }
});

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`📧 Email envoyé à ${to} : ${info.messageId}`);
    return { success: true, info };
  } catch (error) {
    console.error("❌ Erreur d'envoi email :", error);
    throw new Error("Impossible d'envoyer l'email.");
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const html = `
    <h1>Réinitialisation de votre mot de passe</h1>
    <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>Ce lien est valable 1 heure.</p>
  `;
  return sendEmail({ to, subject: "Réinitialisation de votre mot de passe", html });
}

export async function sendVerificationEmail(to: string, verifyLink: string) {
  const html = `
    <h1>Vérification de votre adresse email</h1>
    <p>Cliquez sur le lien ci-dessous pour vérifier votre email :</p>
    <a href="${verifyLink}">${verifyLink}</a>
    <p>Ce lien est valable 24h.</p>
  `;
  return sendEmail({ to, subject: "Vérifiez votre email", html });
}

export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
    <h1>Bienvenue sur Octavia Event !</h1>
    <p>Bonjour ${name},</p>
    <p>Merci de vous être inscrit sur Octavia Event. Nous sommes ravis de vous accueillir.</p>
    <p>Vous pouvez dès maintenant créer vos événements et inviter vos proches.</p>
    <p>Pour commencer, veuillez vérifier votre adresse email en cliquant sur le lien que vous avez reçu dans un autre email.</p>
    <p>À très bientôt,<br/>L'équipe Octavia Event</p>
  `;
  return sendEmail({ to, subject: "Bienvenue sur Octavia Event", html });
}