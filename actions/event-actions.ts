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

    const slug = randomUUID();

    // Nettoyer les données pour éviter les champs inconnus
    const { brideName, groomName, age, thesisTitle, ...cleanData } = data;

    const event = await prisma.event.create({
      data: {
        ...cleanData,
        userId: session.user.id,
        slug,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, event };
  } catch (error) {
    console.error("Erreur createEvent:", error);
    throw new Error("Erreur lors de la création de l'événement");
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

    const { brideName, groomName, age, thesisTitle, ...cleanData } = data;

    const updated = await prisma.event.update({
      where: { slug },
      data: cleanData,
    });

    revalidatePath(`/dashboard/${slug}`);
    return { success: true, event: updated };
  } catch (error) {
    console.error("Erreur updateEvent:", error);
    throw new Error("Erreur lors de la mise à jour");
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
  } catch (error) {
    console.error("Erreur deleteEvent:", error);
    throw new Error("Erreur lors de la suppression");
  }
}