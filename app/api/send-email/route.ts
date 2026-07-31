import { NextResponse } from "next/server";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { type, to, data } = await request.json();

    if (type === "welcome") {
      await sendWelcomeEmail(to, data.name);
    } else if (type === "verify") {
      await sendVerificationEmail(to, data.verifyLink);
    } else if (type === "reset") {
      await sendPasswordResetEmail(to, data.resetLink);
    } else {
      return NextResponse.json({ error: "Type d'email non pris en charge" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur API send-email:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}