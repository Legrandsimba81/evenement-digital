import { prisma } from "@/lib/prisma";

export async function canManageEvent(eventId: string, userId: string): Promise<boolean> {
  if (!userId) return false;

  // 1. Vérifier que l'utilisateur est actif
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { canCreateEvents: true },
  });
  if (!user || !user.canCreateEvents) return false; // Désactivé → refus

  // 2. Vérifier si l'utilisateur est propriétaire
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { userId: true },
  });
  if (!event) return false;
  if (event.userId === userId) return true;

  // 3. Vérifier si l'utilisateur est collaborateur
  const collaborator = await prisma.eventCollaborator.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  return !!collaborator;
}