import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const currentUserId = session.user.id;
  const currentUserIsSuperAdmin = session.user.isSuperAdmin === true;
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "userId requis" }, { status: 400 });
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isSuperAdmin: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (targetUser.id === currentUserId) {
      return NextResponse.json({ error: "Vous ne pouvez pas vous supprimer vous-même" }, { status: 403 });
    }

    if (!currentUserIsSuperAdmin && (targetUser.role === "ADMIN" || targetUser.isSuperAdmin)) {
      return NextResponse.json(
        { error: "Seuls les super admins peuvent supprimer un administrateur" },
        { status: 403 },
      );
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}