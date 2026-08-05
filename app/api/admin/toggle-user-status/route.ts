import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const currentUserIsSuperAdmin = session.user.isSuperAdmin === true;
  const { userId, canCreateEvents } = await req.json();

  if (!userId || typeof canCreateEvents !== "boolean") {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, role: true, isSuperAdmin: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  if (!currentUserIsSuperAdmin && targetUser.role === "ADMIN") {
    return NextResponse.json(
      { error: "Seuls les super admins peuvent modifier le statut des administrateurs" },
      { status: 403 },
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: { canCreateEvents },
  });

  const statusText = canCreateEvents ? "activé" : "désactivé";
  return NextResponse.json({
    success: true,
    message: `Vous avez ${statusText} ${targetUser.name || "l'utilisateur"}`,
  });
}