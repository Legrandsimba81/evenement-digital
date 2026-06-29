import { prisma } from "@/lib/prisma";

export async function canManageEvent(eventId: string, userId?: string): Promise<boolean> {
  if (!userId) return false;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { userId: true },
  });
  if (!event) return false;
  if (event.userId === userId) return true;

  const collaborator = await prisma.eventCollaborator.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  return !!collaborator;
}