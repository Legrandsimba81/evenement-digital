"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function createEvent(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  const slug = randomUUID();
  await prisma.event.create({
    data: {
      ...data,
      userId: session.user.id,
      slug,
    },
  });
  revalidatePath("/dashboard");
}

export async function updateEvent(slug: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event || event.userId !== session.user.id) throw new Error("Non autorisé");

  await prisma.event.update({
    where: { slug },
    data,
  });
  revalidatePath(`/dashboard/${slug}`);
}

export async function deleteEvent(slug: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event || event.userId !== session.user.id) throw new Error("Non autorisé");

  await prisma.event.delete({ where: { slug } });
  revalidatePath("/dashboard");
}