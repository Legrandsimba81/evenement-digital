import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { operator, phone, simName, message, candidateName, candidateEmail } = body;

    if (!operator || !phone || !simName) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    // Instanciation directe de nodemailer.createTransport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || "no-reply@octaviaevent.com",
      to: "legrandsimba81@gmail.com",
      subject: `[CONCOURS] Infos Paiement : ${candidateName || "Nouveau Candidat"}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Informations de Paiement Concours</h2>
          <p>Un candidat a renseigné ses coordonnées de paiement avant la publication de son article.</p>
          
          <table style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 15px;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Candidat :</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${candidateName} (${candidateEmail})</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Opérateur :</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${operator}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Numéro SIM :</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${phone}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Nom sur la SIM :</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${simName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Note/Message :</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${message || "Aucun message"}</td></tr>
          </table>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur envoi email paiement:", error);
    return NextResponse.json({ error: "Échec de l'envoi de l'email" }, { status: 500 });
  }
}