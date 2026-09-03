// lib/notifications.ts
import { prisma } from "@/lib/prisma";

export async function createNotification({
  userId,
  type = "info",
  title,
  message,
  link,
}: {
  userId: string;
  type?: "info" | "warning" | "success" | "error";
  title?: string;
  message: string;
  link?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });
  } catch (error) {
    console.error("Erreur création notification:", error);
  }
}

export async function notifyDepositValidated(userId: string, amount: number, currency: string = "USD") {
  await createNotification({
    userId,
    type: "success",
    title: "Dépôt validé",
    message: `Votre dépôt de ${amount} ${currency} a été validé avec succès.`,
  });
}

export async function notifyDepositRejected(userId: string, amount: number, currency: string = "USD") {
  await createNotification({
    userId,
    type: "error",
    title: "Dépôt rejeté",
    message: `Votre dépôt de ${amount} ${currency} a été rejeté. Veuillez contacter le support.`,
  });
}

export async function notifyEventCreated(userId: string, eventTitle: string, eventSlug: string) {
  await createNotification({
    userId,
    type: "success",
    title: "Événement créé",
    message: `Votre événement "${eventTitle}" a été créé avec succès.`,
    link: `/dashboard/${eventSlug}`,
  });
}

export async function notifyCollaboratorAdded(userId: string, eventTitle: string, collaboratorEmail: string) {
  await createNotification({
    userId,
    type: "info",
    title: "Nouveau collaborateur",
    message: `${collaboratorEmail} a été ajouté comme collaborateur pour "${eventTitle}".`,
  });
}

// Nouvelle fonction pour la limite d'invités atteinte
export async function notifyLimitReached(userId: string, eventType: string, limit: number) {
  await createNotification({
    userId,
    type: "warning",
    title: "Limite d'invités atteinte",
    message: `Vous avez atteint la limite de ${limit} invités pour les événements de type "${eventType}".`,
    link: "/tarifs", // lien vers la page des tarifs pour augmenter la limite
  });
}