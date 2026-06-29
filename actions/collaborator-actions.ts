"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function addCollaborator(eventId: string, email: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!event) throw new Error("Événement non trouvé");
  if (event.userId !== session.user.id) throw new Error("Non autorisé");

  const userToAdd = await prisma.user.findUnique({
    where: { email },
  });
  if (!userToAdd) throw new Error("Utilisateur non trouvé");
  if (userToAdd.id === session.user.id) throw new Error("Vous ne pouvez pas vous ajouter vous-même");

  const existing = await prisma.eventCollaborator.findUnique({
    where: { eventId_userId: { eventId, userId: userToAdd.id } },
  });
  if (existing) throw new Error("Cet utilisateur est déjà collaborateur");

  await prisma.eventCollaborator.create({
    data: {
      eventId,
      userId: userToAdd.id,
      role: "EDITOR",
    },
  });

  revalidatePath(`/dashboard/${event.slug}`);
  revalidatePath(`/dashboard/${event.slug}/collaborators`);
  return { success: true };
}

export async function removeCollaborator(eventId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!event) throw new Error("Événement non trouvé");
  if (event.userId !== session.user.id) throw new Error("Non autorisé");

  if (userId === session.user.id) throw new Error("Vous ne pouvez pas vous retirer vous-même");

  await prisma.eventCollaborator.delete({
    where: { eventId_userId: { eventId, userId } },
  });

  revalidatePath(`/dashboard/${event.slug}`);
  revalidatePath(`/dashboard/${event.slug}/collaborators`);
  return { success: true };
}

export async function getCollaborators(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { user: true },
  });
  if (!event) throw new Error("Événement non trouvé");

  const isOwner = event.userId === session.user.id;
  const isCollaborator = await prisma.eventCollaborator.findUnique({
    where: { eventId_userId: { eventId, userId: session.user.id } },
  });
  if (!isOwner && !isCollaborator) throw new Error("Non autorisé");

  const collaborators = await prisma.eventCollaborator.findMany({
    where: { eventId },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });

  return collaborators || [];
}