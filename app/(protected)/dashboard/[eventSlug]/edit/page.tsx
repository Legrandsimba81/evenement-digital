import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EventForm from "@/components/forms/EventForm";

export default async function EditEventPage({
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
  });

  if (!event || event.userId !== userId) return notFound();

  // ✅ Passer les données au formulaire, en convertissant la date en string
  const eventData = {
    ...event,
    date: event.date.toISOString().split("T")[0], // format YYYY-MM-DD pour le champ date
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Modifier l'événement : {event.title}
      </h1>
      <EventForm initialData={eventData} />
    </div>
  );
}