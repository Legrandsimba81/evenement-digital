"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function createLog(eventId: string, userId: string, action: string, details?: string) {
  console.log(`📝 createLog appelé: eventId=${eventId}, userId=${userId}, action=${action}, details=${details}`);
  try {
    await prisma.eventLog.create({
      data: {
        eventId,
        userId,
        action,
        details,
      },
    });
    console.log("✅ Log créé avec succès");
  } catch (error) {
    console.error("❌ Erreur lors de la création du log:", error);
  }
}

export async function getEventLogs(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const logs = await prisma.eventLog.findMany({
    where: { eventId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  console.log(`📋 ${logs.length} logs trouvés pour l'événement ${eventId}`);
  return logs;
}