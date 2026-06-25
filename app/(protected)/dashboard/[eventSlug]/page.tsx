import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EventDetailsClient from "@/components/EventDetailsClient";

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { eventSlug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: { guests: true, messages: true },
  });

  if (!event || event.userId !== userId) return notFound();

  const eventData = {
    ...event,
    date: event.date.toISOString(),
    invitationText: event.invitationText || null,
    messages: event.messages.map((msg) => ({
      ...msg,
      createdAt: msg.createdAt.toISOString(),
    })),
  };

  return <EventDetailsClient event={eventData} />;
}