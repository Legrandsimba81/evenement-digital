// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "crypto";

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId");
  const response = NextResponse.next();

  if (!sessionId) {
    response.cookies.set("sessionId", randomUUID(), {
      maxAge: 60 * 60 * 24 * 365, // 1 an
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return response;
}

// Optionnel : exécuter le middleware seulement pour certaines routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};