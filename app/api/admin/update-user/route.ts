import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { userId, role, canCreateEvents } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "userId requis" }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role !== undefined && { role }),
        ...(canCreateEvents !== undefined && { canCreateEvents }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        canCreateEvents: true,
      },
    });
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}