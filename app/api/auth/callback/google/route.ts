import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXTAUTH_URL + "/api/auth/callback/google"
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }
  try {
    const { tokens } = await client.getToken(code);
    const idToken = tokens.id_token;
    if (!idToken) throw new Error("No id_token");
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error("Invalid token");
    const email = payload.email;
    if (!email) {
      throw new Error("Email not provided by Google");
    }
    const name = payload.name || "Utilisateur Google";
    const picture = payload.picture || null;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          image: picture,
          password: null,
          role: "USER",
        },
      });
    } else {
      if (!user.image && picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { image: picture },
        });
      }
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.redirect(`octavia-app://auth?token=${token}`);
  } catch (error) {
    console.error("Erreur callback Google:", error);
    return NextResponse.redirect(`octavia-app://auth?error=oauth_failed`);
  }
}