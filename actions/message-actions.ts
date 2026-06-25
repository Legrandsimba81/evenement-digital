"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addMessage(eventId: string, guestName: string, content: string) {
  await prisma.message.create({
    data: {
      content,
      guestName,
      eventId,
    },
  });
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (event) revalidatePath(`/invitation/${event.slug}`);
}