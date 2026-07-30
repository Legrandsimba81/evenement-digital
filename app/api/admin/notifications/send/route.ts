import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { target, userId, title, message, type } = await request.json();

  if (!message) {
    return NextResponse.json({ error: "Le message est requis" }, { status: 400 });
  }

  let usersToNotify = [];

  if (target === "all") {
    usersToNotify = await prisma.user.findMany({ select: { id: true } });
  } else if (target === "specific" && userId) {
    usersToNotify = [{ id: userId }];
  } else {
    return NextResponse.json({ error: "Cible invalide" }, { status: 400 });
  }

  // Créer une notification pour chaque utilisateur
  await Promise.all(
    usersToNotify.map((u) =>
      createNotification({
        userId: u.id,
        type: type || "info",
        title: title || undefined,
        message,
      })
    )
  );

  return NextResponse.json({ success: true, count: usersToNotify.length });
}