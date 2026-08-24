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

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`Erreur lors de l'envoi de l'email à ${to}:`, error);
  }
};

// Layout générique réutilisable pour structurer proprement les emails HTML
const emailTemplate = (content: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
    <div style="background-color: #2563eb; color: #ffffff; padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 22px;">Concours de Rédaction</h1>
    </div>
    <div style="padding: 24px; color: #334155; line-height: 1.6;">
      ${content}
    </div>
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
      <p style="margin: 0;">Merci de participer à nos initiatives numériques.</p>
    </div>
  </div>
`;

// 1. Confirmation de réception de candidature
export async function sendSubmissionConfirmation({ to, authorName, title }: { to: string; authorName: string; title: string }) {
  const subject = `Confirmation : Candidature enregistrée "${title}"`;
  const html = emailTemplate(`
    <h2>Bonjour ${authorName},</h2>
    <p>Votre article <strong>"${title}"</strong> a bien été enregistré.</p>
    <p>Dès sa validation par l'équipe administrative, vous recevrez votre prime initiale de <strong>2$</strong> et votre article sera ouvert aux votes.</p>
    <p><strong>Structure des prix (Seuil : 1000 likes) :</strong></p>
    <ul>
      <li>🥇 1er Gagnant : <strong>50$</strong></li>
      <li>🥈 2ème Gagnant : <strong>20$</strong></li>
      <li>🥉 3ème Gagnant : <strong>10$</strong></li>
    </ul>
  `);
  await sendEmail(to, subject, html);
}

// 2. Notification d'approbation (+2$)
export async function sendApprovalEmail({ to, authorName, title, link }: { to: string; authorName: string; title: string; link: string }) {
  const subject = `Bravo ! Votre article est approuvé (+2$)`;
  const html = emailTemplate(`
    <h2>Félicitations ${authorName} !</h2>
    <p>Votre article <strong>"${title}"</strong> a été validé. Un crédit de <strong>2$</strong> a été ajouté à votre solde.</p>
    <p>Vous pouvez dès maintenant partager votre lien pour atteindre les 1000 likes :</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${link}" style="padding: 12px 24px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Voir et partager mon article</a>
    </p>
  `);
  await sendEmail(to, subject, html);
}

// 3. Notification personnelle au gagnant qui vient de débloquer un rang
export async function sendWinnerNotification({
  to,
  authorName,
  rank,
  prize,
  title,
}: {
  to: string;
  authorName: string;
  rank: number;
  prize: number;
  title: string;
}) {
  const medals = ["🥇", "🥈", "🥉"];
  const rankLabel = rank === 1 ? "1er" : `${rank}ème`;
  const medal = medals[rank - 1] || "🏆";

  const subject = `${medal} Félicitations ! Vous avez décroché la ${rankLabel} place !`;
  const html = emailTemplate(`
    <h2>Exploit accompli, ${authorName} !</h2>
    <p>Votre article <strong>"${title}"</strong> vient d'atteindre le cap des <strong>1000 likes</strong> !</p>
    <p>Vous terminez à la <strong>${rankLabel} position (${medal})</strong> du concours et gagnez un prix supplémentaire de <strong>${prize}$</strong> !</p>
    <p>Le montant a été crédité sur votre compte.</p>
  `);
  await sendEmail(to, subject, html);
}

// 4. Notification générale à tous les candidats quand un prix est remporté
export async function notifyParticipantsAboutWinner({
  participantsEmails,
  winnerName,
  rank,
  prize,
}: {
  participantsEmails: string[];
  winnerName: string;
  rank: number;
  prize: number;
}) {
  const rankLabel = rank === 1 ? "1er" : `${rank}ème`;
  const subject = `📢 Mise à jour Concours : La ${rankLabel} place a été remportée !`;
  const html = emailTemplate(`
    <h2>Du nouveau dans la compétition !</h2>
    <p>Le candidat <strong>${winnerName}</strong> vient d'atteindre la barre des 1000 likes et s'empare de la <strong>${rankLabel} place</strong> avec une récompense de <strong>${prize}$</strong> !</p>
    <p>La compétition continue ! Mobilisez vos lecteurs et partagez votre article pour décrocher les places restantes.</p>
  `);

  // Envoi groupé à l'ensemble des candidats
  await Promise.all(participantsEmails.map((email) => sendEmail(email, subject, html)));
}

// 5. Email de clôture et de remerciement envoyé à la fin du concours
export async function sendCompetitionClosingEmail({
  participants,
  winners,
}: {
  participants: { email: string; name: string }[];
  winners: { name: string; rank: number; prize: number; title: string }[];
}) {
  const winnersListHtml = winners
    .map(
      (w) =>
        `<li style="margin-bottom: 8px;"><strong>Rang #${w.rank} (${w.prize}$) :</strong> ${w.name} — <em>"${w.title}"</em></li>`
    )
    .join("");

  const subject = `🏆 Clôture du Concours : Découvrez le podium final !`;

  for (const participant of participants) {
    const html = emailTemplate(`
      <h2>Merci pour votre participation, ${participant.name} !</h2>
      <p>Le concours de rédaction touche à sa fin. Nous tenons à féliciter chaleureusement l'ensemble des participants pour la qualité de leurs écrits.</p>
      
      <h3>Voici les 3 grand(e)s gagnant(e)s de cette édition :</h3>
      <ul>
        ${winnersListHtml}
      </ul>

      <p>Même si vous n'avez pas atteint le podium cette fois-ci, votre implication contribue directement au rayonnement de la communauté.</p>
      <p>Restez à l'affût, de prochains concours et événements seront annoncés très bientôt !</p>
    `);

    await sendEmail(participant.email, subject, html);
  }
}