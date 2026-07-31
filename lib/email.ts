// lib/email.ts
import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // ou votre fournisseur SMTP
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
    <h1>Réinitialisation de votre mot de passe</h1>
    <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>Ce lien est valable 1 heure.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Réinitialisation de votre mot de passe",
    html,
  });
}

// lib/email.ts (ajout)
export async function sendVerificationEmail(to: string, verifyLink: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
    <h1>Vérification de votre adresse email</h1>
    <p>Cliquez sur le lien ci-dessous pour vérifier votre email :</p>
    <a href="${verifyLink}">${verifyLink}</a>
    <p>Ce lien est valable 24h.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Vérifiez votre email",
    html,
  });
}