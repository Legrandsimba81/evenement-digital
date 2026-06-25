"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function addGuest(eventId: string, firstName: string, lastName: string, title?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.userId !== session.user.id) throw new Error("Non autorisé");

  await prisma.guest.create({
    data: {
      firstName,
      lastName,
      title: title || null,
      eventId,
    },
  });
  revalidatePath(`/dashboard/${event.slug}`);
}

export async function removeGuest(guestId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  const guest = await prisma.guest.findUnique({ where: { id: guestId }, include: { event: true } });
  if (!guest || guest.event.userId !== session.user.id) throw new Error("Non autorisé");

  await prisma.guest.delete({ where: { id: guestId } });
  revalidatePath(`/dashboard/${guest.event.slug}`);
}

export async function updateGuest(guestId: string, data: { title?: string; firstName?: string; lastName?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  const guest = await prisma.guest.findUnique({ where: { id: guestId }, include: { event: true } });
  if (!guest || guest.event.userId !== session.user.id) throw new Error("Non autorisé");

  await prisma.guest.update({
    where: { id: guestId },
    data: {
      title: data.title || null,
      firstName: data.firstName,
      lastName: data.lastName,
    },
  });
  revalidatePath(`/dashboard/${guest.event.slug}`);
}

export async function getGuests(eventId: string, search?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.userId !== session.user.id) throw new Error("Non autorisé");

  return prisma.guest.findMany({
    where: {
      eventId,
      OR: search ? [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ] : undefined,
    },
    orderBy: { firstName: "asc" },
  });
}