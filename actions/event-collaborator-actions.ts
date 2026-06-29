"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Vérifier si l'utilisateur est autorisé (créateur ou co-organisateur)
export async function checkEventPermission(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { collaborators: true },
  });
  if (!event) return false;
  if (event.userId === userId) return true;
  return event.collaborators.some(c => c.userId === userId);
}

// Ajouter un co-organisateur (seul le créateur peut le faire)
export async function addCollaborator(eventId: string, email: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { collaborators: true },
  });
  if (!event) throw new Error("Événement non trouvé");
  // Seul le créateur peut ajouter des collaborateurs
  if (event.userId !== session.user.id) {
    throw new Error("Seul le propriétaire de l'événement peut ajouter des collaborateurs");
  }

  // Trouver l'utilisateur par email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Utilisateur non trouvé");

  // Vérifier qu'il n'est pas déjà collaborateur ou créateur
  if (event.userId === user.id) {
    throw new Error("Cet utilisateur est déjà le propriétaire de l'événement");
  }
  const alreadyCollaborator = event.collaborators.some(c => c.userId === user.id);
  if (alreadyCollaborator) {
    throw new Error("Cet utilisateur est déjà collaborateur");
  }

  await prisma.eventCollaborator.create({
    data: {
      eventId,
      userId: user.id,
      role: "admin",
    },
  });

  revalidatePath(`/dashboard/${event.slug}`);
  revalidatePath(`/dashboard/${event.slug}/admin`);
  return { success: true };
}

// Retirer un co-organisateur (seul le créateur peut le faire)
export async function removeCollaborator(eventId: string, collaboratorId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { collaborators: true },
  });
  if (!event) throw new Error("Événement non trouvé");
  if (event.userId !== session.user.id) {
    throw new Error("Seul le propriétaire peut retirer des collaborateurs");
  }

  const collaborator = event.collaborators.find(c => c.id === collaboratorId);
  if (!collaborator) throw new Error("Collaborateur non trouvé");

  // Ne pas retirer le propriétaire
  if (collaborator.userId === event.userId) {
    throw new Error("Impossible de retirer le propriétaire");
  }

  await prisma.eventCollaborator.delete({ where: { id: collaboratorId } });
  revalidatePath(`/dashboard/${event.slug}`);
  revalidatePath(`/dashboard/${event.slug}/admin`);
  return { success: true };
}

// Récupérer les collaborateurs d'un événement
export async function getCollaborators(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { collaborators: { include: { user: true } } },
  });
  if (!event) throw new Error("Événement non trouvé");

  // Vérifier que l'utilisateur est autorisé (créateur ou collaborateur)
  const isCreator = event.userId === session.user.id;
  const isCollaborator = event.collaborators.some(c => c.userId === session.user.id);
  if (!isCreator && !isCollaborator) {
    throw new Error("Non autorisé");
  }

  return {
    owner: { id: event.userId, name: (await prisma.user.findUnique({ where: { id: event.userId } }))?.name },
    collaborators: event.collaborators.map(c => ({ id: c.id, userId: c.userId, name: c.user.name, email: c.user.email })),
  };
}