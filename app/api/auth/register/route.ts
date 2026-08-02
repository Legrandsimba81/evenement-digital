// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    // Validations
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires." },
        { status: 400 }
      );
    }

    if (!/^0\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Le téléphone doit contenir 10 chiffres et commencer par 0." },
        { status: 400 }
      );
    }

    // Vérifier l'unicité
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé." },
        { status: 400 }
      );
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json(
        { error: "Ce numéro de téléphone est déjà utilisé." },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        phone,
        role: "USER",
      },
    });

    // Ici, vous pouvez envoyer un email de bienvenue et de vérification
    // (optionnel)

    return NextResponse.json(
      { success: true, userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur inscription:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}