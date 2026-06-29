import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EventDetailsClient from "@/components/EventDetailsClient";
import { Calendar } from "lucide-react";

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

  const isPast = new Date(event.date) < new Date();

  // Convertir les dates pour le client
  const eventData = {
    ...event,
    date: event.date.toISOString(),
    invitationText: event.invitationText || null,
    program: event.program || null,
    messages: event.messages.map((msg: any) => ({
      ...msg,
      createdAt: msg.createdAt.toISOString(),
    })),
  };

  return (
    <>
      {isPast && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Calendar size={20} className="text-gray-500" />
            <span>
              Cet événement a eu lieu le <strong>{new Date(event.date).toLocaleDateString('fr-FR')}</strong>.
            </span>
          </div>
        </div>
      )}
      <EventDetailsClient event={eventData} />
    </>
  );
}