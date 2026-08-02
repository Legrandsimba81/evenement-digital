// app/api/auth/mobile-login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur a un mot de passe (compte local)
    if (!user.password) {
      return NextResponse.json(
        { error: "Ce compte utilise Google. Veuillez vous connecter avec Google." },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // Générer un JWT
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

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
      },
    });
  } catch (error) {
    console.error("Erreur login mobile:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}