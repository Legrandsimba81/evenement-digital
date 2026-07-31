// lib/email.ts
import nodemailer from "nodemailer";

// 1. Vérification des variables d’environnement
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM) {
  console.error(
    "❌ Variables d'environnement EMAIL_USER, EMAIL_PASS ou EMAIL_FROM manquantes. Les emails ne fonctionneront pas."
  );
}

// 2. Création du transporteur avec configuration explicite (Gmail)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true pour port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Active les logs pour voir ce qui se passe
  debug: true,
  logger: true,
});

// 3. Vérification de la connexion au démarrage (facultatif, mais utile)
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Échec de la connexion au serveur SMTP :", error);
  } else {
    console.log("✅ Serveur SMTP prêt à envoyer des emails.");
  }
});

// 4. Fonction générique d’envoi (avec gestion d’erreurs)
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
  } catch (error: any) {
    console.error("❌ Erreur lors de l'envoi de l'email :", error);
    // On relance l'erreur pour que l'appelant puisse la traiter
    throw new Error(error.message || "Erreur d'envoi d'email");
  }
}

// 5. Fonctions spécifiques
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