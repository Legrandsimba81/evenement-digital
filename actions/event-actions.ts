// actions/event-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { randomUUID, randomBytes } from "crypto";
import { canManageEvent } from "@/lib/permissions";
import { createLog } from "@/actions/log-actions";
import { notifyEventCreated, createNotification } from "@/lib/notifications";
import { z } from "zod";

// ---------- Schéma de validation pour la création ----------
const EventCreateSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  type: z.string().min(1, "Type requis"),
  description: z.string().optional().nullable(),
  invitationText: z.string().optional().nullable(),
  program: z.string().optional().nullable(),
  location: z.string().min(1, "Lieu requis"),
  date: z.string().or(z.date()),
  time: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  invitationImageUrl: z.string().url().optional().nullable(),
  thesisTitle: z.string().optional().nullable(),
  theme: z.any().optional().nullable(),
  format: z.string().optional().nullable(),
});

// ---------- Schéma de validation pour la mise à jour ----------
const EventUpdateSchema = z.object({
  title: z.string().min(1, "Titre requis").optional(),
  type: z.string().min(1, "Type requis").optional(),
  description: z.string().optional().nullable(),
  invitationText: z.string().optional().nullable(),
  program: z.string().optional().nullable(),
  location: z.string().min(1, "Lieu requis").optional(),
  date: z.string().or(z.date()).optional(),
  time: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  invitationImageUrl: z.string().url().optional().nullable(),
  thesisTitle: z.string().optional().nullable(),
  theme: z.any().optional().nullable(),
  // Nouveaux champs de localisation (optionnels)
  locationName: z.string().optional().nullable(),
  locationAddress: z.string().optional().nullable(),
  locationLat: z.number().optional().nullable(),
  locationLng: z.number().optional().nullable(),
  locationUrl: z.string().url().optional().nullable(),
});

// ---------- Création ----------
export async function createEvent(data: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { canCreateEvents: true, eventLimits: true },
    });
    if (!user?.canCreateEvents) {
      throw new Error("Votre compte est désactivé. Vous ne pouvez pas créer d'événement.");
    }

    const validated = EventCreateSchema.parse(data);
    const eventType = validated.type;

    const limits = user.eventLimits as Record<string, number | null> | null;
    const limit = limits?.[eventType] ?? 5;

    const existingGuestsCount = await prisma.guest.count({
      where: {
        event: {
          userId: session.user.id,
          type: eventType,
        },
      },
    });

    if (limit !== null && existingGuestsCount >= limit) {
      throw new Error(
        `Limite atteinte : vous ne pouvez pas ajouter plus de ${limit} invités pour les événements de type "${eventType}".`
      );
    }

    const eventDate = typeof validated.date === 'string' ? new Date(validated.date) : validated.date;
    if (isNaN(eventDate.getTime())) throw new Error("Date invalide");

    const slug = randomUUID();
    const gateSecret = randomBytes(32).toString("hex");

    let themeValue = null;
    if (validated.theme) {
      try {
        themeValue = typeof validated.theme === 'string' ? validated.theme : JSON.stringify(validated.theme);
      } catch {
        themeValue = null;
      }
    }

    const eventData: any = {
      title: validated.title,
      type: validated.type,
      description: validated.description || undefined,
      invitationText: validated.invitationText || undefined,
      program: validated.program || undefined,
      location: validated.location,
      date: eventDate,
      time: validated.time || undefined,
      whatsappNumber: validated.whatsappNumber || undefined,
      imageUrl: validated.imageUrl || undefined,
      invitationImageUrl: validated.invitationImageUrl || undefined,
      thesisTitle: validated.thesisTitle || undefined,
      theme: themeValue,
      format: validated.format || "INVITATION",
      userId: session.user.id,
      slug,
      gateSecret,
    };

    const event = await prisma.event.create({ data: eventData });

    await notifyEventCreated(session.user.id, event.title, event.slug);

    revalidatePath("/dashboard");
    return { success: true, event };
  } catch (error: any) {
    console.error("❌ Erreur createEvent:", error);
    if (error.name === "ZodError") {
      throw new Error(error.errors.map((e: any) => e.message).join(", "));
    }
    throw new Error(error.message || "Erreur lors de la création");
  }
}

// ---------- Mise à jour ----------
export async function updateEvent(slug: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) throw new Error("Événement non trouvé");

    const hasAccess = await canManageEvent(event.id, session.user.id);
    if (!hasAccess) throw new Error("Non autorisé");

    const validated = EventUpdateSchema.parse(data);

    // Construction explicite de l'objet de mise à jour
    const updateData: any = {};

    // Champs de base
    if (validated.title !== undefined && validated.title !== null) updateData.title = validated.title;
    if (validated.type !== undefined && validated.type !== null) updateData.type = validated.type;
    if (validated.description !== undefined && validated.description !== null) updateData.description = validated.description;
    if (validated.invitationText !== undefined && validated.invitationText !== null) updateData.invitationText = validated.invitationText;
    if (validated.program !== undefined && validated.program !== null) updateData.program = validated.program;
    if (validated.location !== undefined && validated.location !== null) updateData.location = validated.location;
    if (validated.time !== undefined && validated.time !== null) updateData.time = validated.time;
    if (validated.whatsappNumber !== undefined && validated.whatsappNumber !== null) updateData.whatsappNumber = validated.whatsappNumber;
    if (validated.imageUrl !== undefined && validated.imageUrl !== null) updateData.imageUrl = validated.imageUrl;
    if (validated.invitationImageUrl !== undefined && validated.invitationImageUrl !== null) updateData.invitationImageUrl = validated.invitationImageUrl;
    if (validated.thesisTitle !== undefined && validated.thesisTitle !== null) updateData.thesisTitle = validated.thesisTitle;

    // Date
    if (validated.date !== undefined && validated.date !== null) {
      const eventDate = typeof validated.date === 'string' ? new Date(validated.date) : validated.date;
      if (isNaN(eventDate.getTime())) throw new Error("Date invalide");
      updateData.date = eventDate;
    }

    // Theme
    if (validated.theme !== undefined && validated.theme !== null) {
      let themeValue = null;
      try {
        themeValue = typeof validated.theme === 'string' ? validated.theme : JSON.stringify(validated.theme);
      } catch {
        themeValue = null;
      }
      updateData.theme = themeValue;
    }

    // ✅ Champs de localisation avancée
    if (validated.locationName !== undefined && validated.locationName !== null) updateData.locationName = validated.locationName;
    if (validated.locationAddress !== undefined && validated.locationAddress !== null) updateData.locationAddress = validated.locationAddress;
    if (validated.locationLat !== undefined && validated.locationLat !== null) updateData.locationLat = validated.locationLat;
    if (validated.locationLng !== undefined && validated.locationLng !== null) updateData.locationLng = validated.locationLng;
    if (validated.locationUrl !== undefined && validated.locationUrl !== null) updateData.locationUrl = validated.locationUrl;

    // Si aucun champ n'est à mettre à jour, on peut retourner une erreur
    if (Object.keys(updateData).length === 0) {
      throw new Error("Aucune donnée à mettre à jour.");
    }

    const updated = await prisma.event.update({
      where: { slug },
      data: updateData,
    });

    await createLog(event.id, session.user.id, "UPDATED_EVENT", `Modification de l'événement "${event.title}"`);

    await createNotification({
      userId: session.user.id,
      type: "info",
      title: "Événement modifié",
      message: `L'événement "${updated.title}" a été mis à jour.`,
      link: `/dashboard/${slug}`,
    });

    revalidatePath(`/dashboard/${slug}`);
    return { success: true, event: updated };
  } catch (error: any) {
    console.error("❌ Erreur updateEvent:", error);
    if (error.name === "ZodError") {
      throw new Error(error.errors.map((e: any) => e.message).join(", "));
    }
    throw new Error(error.message || "Erreur lors de la mise à jour");
  }
}

// ---------- Suppression ----------
export async function deleteEvent(slug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) throw new Error("Événement non trouvé");

    const hasAccess = await canManageEvent(event.id, session.user.id);
    if (!hasAccess) throw new Error("Non autorisé");

    const eventTitle = event.title;

    await prisma.event.delete({ where: { slug } });

    await createNotification({
      userId: session.user.id,
      type: "warning",
      title: "Événement supprimé",
      message: `L'événement "${eventTitle}" a été supprimé.`,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Erreur deleteEvent:", error);
    throw new Error(error.message || "Erreur lors de la suppression");
  }
}

// ---------- Suppression par admin ----------
export async function deleteEventAsAdmin(slug: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("Non autorisé");
    }

    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) throw new Error("Événement non trouvé");

    const eventTitle = event.title;
    const ownerId = event.userId;

    await prisma.event.delete({ where: { slug } });

    await createNotification({
      userId: ownerId,
      type: "error",
      title: "Événement supprimé par l'admin",
      message: `Votre événement "${eventTitle}" a été supprimé par l'administration.`,
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Erreur deleteEventAsAdmin:", error);
    throw new Error(error.message || "Erreur lors de la suppression");
  }
}

// Générer ou récupérer le token QR pour les invités non listés
export async function getOrCreateUnlistedQrToken(eventSlug: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    select: { id: true, userId: true, unlistedQrToken: true, isPaid: true },
  });
  if (!event) throw new Error("Événement introuvable");
  if (!event.isPaid) throw new Error("Fonctionnalité réservée aux événements payants");

  const hasAccess = await canManageEvent(event.id, session.user.id);
  if (!hasAccess) throw new Error("Non autorisé");

  // Si le token n'existe pas, le générer
  if (!event.unlistedQrToken) {
    const token = randomBytes(32).toString("hex");
    await prisma.event.update({
      where: { id: event.id },
      data: { unlistedQrToken: token },
    });
    return token;
  }
  return event.unlistedQrToken;
}

// Réinitialiser le compteur des invités non listés (pour l'admin)
export async function resetUnlistedGuestsCount(eventSlug: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    select: { id: true, userId: true, isPaid: true },
  });
  if (!event) throw new Error("Événement introuvable");
  if (!event.isPaid) throw new Error("Fonctionnalité réservée aux événements payants");

  const hasAccess = await canManageEvent(event.id, session.user.id);
  if (!hasAccess) throw new Error("Non autorisé");

  await prisma.event.update({
    where: { id: event.id },
    data: { unlistedGuestsCount: 0 },
  });

  revalidatePath(`/dashboard/${eventSlug}/unlisted-qr`);
  return { success: true };
}

// ---------- Inverser le statut Payant / Gratuit ----------
export async function toggleEventPaid(slug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) throw new Error("Événement non trouvé");

    const hasAccess = await canManageEvent(event.id, session.user.id);
    if (!hasAccess) throw new Error("Non autorisé");

    const updated = await prisma.event.update({
      where: { slug },
      data: { isPaid: !event.isPaid },
    });

    revalidatePath(`/dashboard/${slug}`);
    return { success: true, isPaid: updated.isPaid };
  } catch (error: any) {
    console.error("❌ Erreur toggleEventPaid:", error);
    throw new Error(error.message || "Erreur lors de la modification du statut");
  }
}