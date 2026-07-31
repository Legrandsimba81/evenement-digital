import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: true,
      logger: true,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: "congovodacom1@gmail.com",
      subject: "Test",
      text: "Ceci est un test.",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur SMTP :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}