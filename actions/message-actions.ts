"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { canManageEvent } from "@/lib/permissions";

export async function addMessage(eventId: string, guestName: string, content: string, guestId?: string) {
  const message = await prisma.message.create({
    data: {
      content,
      guestName,
      guestId: guestId || null,
      eventId,
    },
  });
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (event) revalidatePath(`/invitation/${event.slug}`);
  return message;
}

export async function deleteMessage(messageId: string, guestId?: string, isOrganizer = false) {
  const session = await auth();
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { event: true },
  });
  if (!message) throw new Error("Message non trouvé");

  if (isOrganizer) {
    if (!session?.user?.id) throw new Error("Non authentifié");
    const hasAccess = await canManageEvent(message.eventId, session.user.id);
    if (!hasAccess) throw new Error("Non autorisé");
  } else {
    if (!guestId) throw new Error("guestId requis");
    if (message.guestId !== guestId) throw new Error("Non autorisé");
  }

  await prisma.message.delete({ where: { id: messageId } });
  revalidatePath(`/invitation/${message.event.slug}`);
  if (session?.user) revalidatePath(`/dashboard/${message.event.slug}`);
}

export async function updateMessage(messageId: string, newContent: string, isOrganizer: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { event: true },
  });

  if (!message) throw new Error("Message non trouvé");

  if (isOrganizer) {
    if (message.event.userId !== session.user.id) {
      // Vérifier si l'utilisateur est collaborateur avec permissions (optionnel)
      const collaborator = await prisma.eventCollaborator.findUnique({
        where: { eventId_userId: { eventId: message.eventId, userId: session.user.id } },
      });
      if (!collaborator) throw new Error("Non autorisé");
    }
  } else {
    throw new Error("Seul l'organisateur peut modifier un message");
  }

  await prisma.message.update({
    where: { id: messageId },
    data: { content: newContent },
  });

  revalidatePath(`/invitation/${message.event.slug}`);
  revalidatePath(`/dashboard/${message.event.slug}`);
}