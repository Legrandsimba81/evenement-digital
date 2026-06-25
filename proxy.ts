import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";
  const path = req.nextUrl.pathname;

  const publicPaths = ['/login', '/register', '/invitation'];
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }

  if (path === '/') {
    return NextResponse.next();
  }

  if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (path.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};