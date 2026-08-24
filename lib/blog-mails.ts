import nodemailer from "nodemailer";

const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
};

const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = getTransporter();
  if (!transporter) return;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

export async function sendSubmissionConfirmation({ to, authorName, title }: { to: string; authorName: string; title: string }) {
  const subject = `Confirmation : Candidature enregistrée "${title}"`;
  const html = `
    <h2>Bonjour ${authorName},</h2>
    <p>Votre article <strong>"${title}"</strong> a été correctement soumis au concours de rédaction.</p>
    <p>Dès sa validation par l'administration, vous recevrez une prime d'approbation de <strong>2$</strong> et votre article sera ouvert aux votes.</p>
    <p>Rappel des prix aux 1000 likes :</p>
    <ul>
      <li>🥇 1er à atteindre 1000 likes : <strong>50$</strong></li>
      <li>🥈 2ème à atteindre 1000 likes : <strong>20$</strong></li>
      <li>🥉 3ème à atteindre 1000 likes : <strong>10$</strong></li>
    </ul>
  `;
  await sendEmail(to, subject, html);
}

export async function sendApprovalEmail({ to, authorName, title, link }: { to: string; authorName: string; title: string; link: string }) {
  const subject = `Bravo ! Votre article est approuvé (+2$)`;
  const html = `
    <h2>Félicitations ${authorName} !</h2>
    <p>Votre article <strong>"${title}"</strong> a été approuvé. Un crédit de <strong>2$</strong> a été ajouté à votre cagnotte.</p>
    <p>Partagez votre lien pour récolter 1000 likes au plus vite :</p>
    <p><a href="${link}" style="padding:10px 20px;background:#2563EB;color:white;border-radius:8px;text-decoration:none;display:inline-block;">Voir mon article</a></p>
  `;
  await sendEmail(to, subject, html);
}