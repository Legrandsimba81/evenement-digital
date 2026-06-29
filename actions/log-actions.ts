"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * Crée une entrée de log pour un événement
 */
export async function createLog(eventId: string, userId: string, action: string, details?: string) {
  await prisma.eventLog.create({
    data: {
      eventId,
      userId,
      action,
      details,
    },
  });
}

/**
 * Récupère tous les logs d'un événement
 */
export async function getEventLogs(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const logs = await prisma.eventLog.findMany({
    where: { eventId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return logs;
}