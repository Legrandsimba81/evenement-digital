"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function createEvent(data: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Non authentifié");
    }

    // ✅ Liste des champs autorisés pour le modèle Event
    const allowedFields = [
      "title",
      "type",
      "description",
      "invitationText",
      "program",
      "location",
      "date",
      "time",
      "whatsappNumber",
      "imageUrl",
      "invitationImageUrl",
      "invitationType",
    ];

    // Nettoyer les données
    const cleanData: any = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined && data[key] !== null) {
        cleanData[key] = data[key];
      }
    }

    // ✅ Valider et convertir la date
    if (!cleanData.date) {
      throw new Error("La date est requise");
    }
    cleanData.date = new Date(cleanData.date);
    if (isNaN(cleanData.date.getTime())) {
      throw new Error("Date invalide");
    }

    const slug = randomUUID();
    const eventData = {
      ...cleanData,
      userId: session.user.id,
      slug,
    };

    // ✅ Log pour déboguer (visible sur Vercel)
    console.log("📦 Payload final pour Prisma:", JSON.stringify(eventData, null, 2));

    const event = await prisma.event.create({
      data: eventData,
    });

    revalidatePath("/dashboard");
    return { success: true, event };
  } catch (error: any) {
    console.error("❌ Erreur createEvent:", error);
    // En production, on renvoie un message d'erreur générique
    throw new Error(error.message || "Erreur lors de la création de l'événement");
  }
}

export async function updateEvent(slug: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event || event.userId !== session.user.id) {
      throw new Error("Non autorisé");
    }

    const allowedFields = [
      "title",
      "type",
      "description",
      "invitationText",
      "program",
      "location",
      "date",
      "time",
      "whatsappNumber",
      "imageUrl",
      "invitationImageUrl",
      "invitationType",
    ];

    const cleanData: any = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined && data[key] !== null) {
        cleanData[key] = data[key];
      }
    }

    if (cleanData.date) {
      cleanData.date = new Date(cleanData.date);
      if (isNaN(cleanData.date.getTime())) {
        throw new Error("Date invalide");
      }
    }

    const updated = await prisma.event.update({
      where: { slug },
      data: cleanData,
    });

    revalidatePath(`/dashboard/${slug}`);
    return { success: true, event: updated };
  } catch (error: any) {
    console.error("❌ Erreur updateEvent:", error);
    throw new Error(error.message || "Erreur lors de la mise à jour");
  }
}

export async function deleteEvent(slug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event || event.userId !== session.user.id) {
      throw new Error("Non autorisé");
    }

    await prisma.event.delete({ where: { slug } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Erreur deleteEvent:", error);
    throw new Error(error.message || "Erreur lors de la suppression");
  }
}