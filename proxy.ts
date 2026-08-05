import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";
  const path = req.nextUrl.pathname;

  // ✅ Création du cookie sessionId pour les likes anonymes
  const sessionId = req.cookies.get("sessionId");
  const response = NextResponse.next();
  if (!sessionId) {
    response.cookies.set("sessionId", randomUUID(), {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  const publicPaths = ['/login', '/register', '/invitation'];
  if (publicPaths.some(p => path.startsWith(p))) {
    return response;
  }

  if (path === '/') {
    return response;
  }

  if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (path.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return response;
  }

  return response;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};