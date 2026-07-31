import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { to, subject, html, userIds } = await request.json();

  if (!subject || !html) {
    return NextResponse.json({ error: "Sujet et contenu requis" }, { status: 400 });
  }

  let recipients: string[] = [];

  if (to === "all") {
    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({ select: { email: true } });
    recipients = users.map((u) => u.email);
  } else if (to === "specific" && Array.isArray(userIds) && userIds.length > 0) {
    // Récupérer les emails des utilisateurs spécifiques
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { email: true },
    });
    recipients = users.map((u) => u.email);
  } else {
    return NextResponse.json({ error: "Destinataires invalides" }, { status: 400 });
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: "Aucun destinataire trouvé" }, { status: 400 });
  }

  try {
    // Envoyer à chaque destinataire (ou en BCC pour éviter de divulguer les adresses)
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_FROM, // en BCC
      bcc: recipients,
      subject,
      html,
    });

    return NextResponse.json({ success: true, count: recipients.length });
  } catch (error: any) {
    console.error("Erreur d'envoi d'email admin:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}