import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const currentUserIsSuperAdmin = session.user.isSuperAdmin === true;
  const { userId, role, canCreateEvents } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "userId requis" }, { status: 400 });
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        isSuperAdmin: true,
        canCreateEvents: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (!currentUserIsSuperAdmin && (targetUser.role === "ADMIN" || targetUser.isSuperAdmin)) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas modifier un administrateur sans le statut de super admin" },
        { status: 403 },
      );
    }

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
        isSuperAdmin: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}