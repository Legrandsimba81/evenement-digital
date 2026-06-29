"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { randomUUID, randomBytes } from "crypto";
import { canManageEvent } from "@/lib/permissions";

export async function createEvent(data: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

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

    if (!cleanData.date) throw new Error("La date est requise");
    cleanData.date = new Date(cleanData.date);
    if (isNaN(cleanData.date.getTime())) throw new Error("Date invalide");

    const slug = randomUUID();
    const gateSecret = randomBytes(32).toString("hex");

    const eventData = {
      ...cleanData,
      userId: session.user.id,
      slug,
      gateSecret,
    };

    const event = await prisma.event.create({ data: eventData });
    revalidatePath("/dashboard");
    return { success: true, event };
  } catch (error: any) {
    console.error("❌ Erreur createEvent:", error);
    throw new Error(error.message || "Erreur lors de la création");
  }
}

export async function updateEvent(slug: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) throw new Error("Événement non trouvé");

    const hasAccess = await canManageEvent(event.id, session.user.id);
    if (!hasAccess) throw new Error("Non autorisé");

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
      if (isNaN(cleanData.date.getTime())) throw new Error("Date invalide");
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
    if (!event) throw new Error("Événement non trouvé");

    const hasAccess = await canManageEvent(event.id, session.user.id);
    if (!hasAccess) throw new Error("Non autorisé");

    await prisma.event.delete({ where: { slug } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Erreur deleteEvent:", error);
    throw new Error(error.message || "Erreur lors de la suppression");
  }
}

export async function deleteEventAsAdmin(slug: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("Non autorisé");
    }

    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) throw new Error("Événement non trouvé");

    await prisma.event.delete({ where: { slug } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Erreur deleteEventAsAdmin:", error);
    throw new Error(error.message || "Erreur lors de la suppression");
  }
}