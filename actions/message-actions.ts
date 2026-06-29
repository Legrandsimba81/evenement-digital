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