// app/api/auth/google-mobile/route.ts
import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXTAUTH_URL + "/api/auth/callback/google-mobile";

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export async function GET(request: Request) {
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    prompt: "select_account",
    redirect_uri: REDIRECT_URI, // ✅ explicite
  });
  return NextResponse.redirect(authUrl);
}