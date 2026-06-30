import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EventForm from "@/components/events/EventForm";

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

  if (!event) return notFound();

  // Vérifier que l'utilisateur a le droit de modifier (propriétaire ou collaborateur)
  const canManage = await import("@/lib/permissions").then((m) =>
    m.canManageEvent(event.id, userId)
  );
  if (!canManage) return notFound();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <EventForm initialData={event} />
    </div>
  );
}