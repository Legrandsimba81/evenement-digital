import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export async function POST(request: Request) {
  const { code, redirectUri } = await request.json();
  if (!code || !redirectUri) {
    return NextResponse.json({ error: "Missing code or redirectUri" }, { status: 400 });
  }
  const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, redirectUri);
  try {
    const { tokens } = await client.getToken({
      code,
      redirect_uri: redirectUri,
    });
    const idToken = tokens.id_token;
    if (!idToken) throw new Error("No id_token");
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error("Invalid token");
    const email = payload.email;
    if (!email) throw new Error("Email missing");
    const name = payload.name || "Utilisateur Google";
    const picture = payload.picture || null;
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name, image: picture, password: null, role: "USER" },
      });
    } else if (!user.image && picture) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { image: picture },
      });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, isSuperAdmin: user.isSuperAdmin },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    );
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Erreur échange code:", error);
    return NextResponse.json({ error: "Token exchange failed" }, { status: 500 });
  }
}