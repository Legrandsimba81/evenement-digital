// actions/collaborator-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  sendCollaboratorAddedEmail,
  sendCollaboratorRemovedEmail,
} from "@/lib/mail-collabo";
import { createNotification } from "@/lib/notifications";

export async function addCollaborator(eventId: string, email: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { collaborators: true, user: true },
  });
  if (!event) throw new Error("Événement non trouvé");
  if (event.userId !== session.user.id) {
    throw new Error("Seul le propriétaire de l'événement peut ajouter des collaborateurs");
  }

  // Limite de 2 collaborateurs
  if (event.collaborators.length >= 2) {
    throw new Error("Vous ne pouvez ajouter que 2 collaborateurs maximum.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, canCreateEvents: true },
  });
  if (!user) throw new Error("Utilisateur non trouvé");
  if (!user.canCreateEvents) {
    throw new Error("Cet utilisateur n'est pas autorisé à collaborer.");
  }

  if (event.userId === user.id) {
    throw new Error("Cet utilisateur est déjà le propriétaire de l'événement");
  }
  const alreadyCollaborator = event.collaborators.some(
    (c: { userId: string }) => c.userId === user.id
  );
  if (alreadyCollaborator) {
    throw new Error("Cet utilisateur est déjà collaborateur");
  }

  const created = await prisma.eventCollaborator.create({
    data: {
      eventId,
      userId: user.id,
      role: "admin",
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  // ✅ Envoyer un email au collaborateur
  const ownerName = session.user.name || "Le propriétaire";
  await sendCollaboratorAddedEmail({
    to: user.email,
    collaboratorName: user.name || "Collaborateur",
    eventTitle: event.title,
    ownerName,
    eventSlug: event.slug,
  }).catch((err) => console.error("Erreur envoi email ajout collabo:", err));

  // Notification interne
  await createNotification({
    userId: session.user.id,
    type: "info",
    title: "Collaborateur ajouté",
    message: `${user.name || email} a été ajouté comme collaborateur sur "${event.title}".`,
    link: `/dashboard/${event.slug}/collaborators`,
  });

  revalidatePath(`/dashboard/${event.slug}`);
  revalidatePath(`/dashboard/${event.slug}/collaborators`);

  return {
    success: true,
    collaborator: {
      id: created.id,
      userId: created.userId,
      name: created.user.name,
      email: created.user.email,
    },
  };
}

export async function removeCollaborator(eventId: string, collaboratorId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { collaborators: { include: { user: true } }, user: true },
  });
  if (!event) throw new Error("Événement non trouvé");
  if (event.userId !== session.user.id) {
    throw new Error("Seul le propriétaire peut retirer des collaborateurs");
  }

  const collaborator = event.collaborators.find(
    (c: { id: string }) => c.id === collaboratorId
  );
  if (!collaborator) throw new Error("Collaborateur non trouvé");

  if (collaborator.userId === event.userId) {
    throw new Error("Impossible de retirer le propriétaire");
  }

  // Récupérer les infos avant suppression
  const collaboratorUser = collaborator.user;
  const ownerName = session.user.name || "Le propriétaire";

  await prisma.eventCollaborator.delete({ where: { id: collaboratorId } });

  // ✅ Envoyer un email au collaborateur retiré
  if (collaboratorUser?.email) {
    await sendCollaboratorRemovedEmail({
      to: collaboratorUser.email,
      collaboratorName: collaboratorUser.name || "Collaborateur",
      eventTitle: event.title,
      ownerName,
    }).catch((err) => console.error("Erreur envoi email retrait collabo:", err));
  }

  // Notification interne
  await createNotification({
    userId: session.user.id,
    type: "warning",
    title: "Collaborateur retiré",
    message: `${collaboratorUser?.name || "Un collaborateur"} a été retiré de "${event.title}".`,
    link: `/dashboard/${event.slug}/collaborators`,
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
    include: { collaborators: { include: { user: true } } },
  });
  if (!event) throw new Error("Événement non trouvé");

  const isCreator = event.userId === session.user.id;
  const isCollaborator = event.collaborators.some(
    (c: { userId: string }) => c.userId === session.user.id
  );
  if (!isCreator && !isCollaborator) {
    throw new Error("Non autorisé");
  }

  const owner = await prisma.user.findUnique({
    where: { id: event.userId },
    select: { id: true, name: true },
  });

  return {
    owner: owner ? { id: owner.id, name: owner.name } : null,
    collaborators: event.collaborators.map((c: any) => ({
      id: c.id,
      userId: c.userId,
      name: c.user.name,
      email: c.user.email,
    })),
  };
}