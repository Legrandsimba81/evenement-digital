import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EventTypeForm from "@/components/events/EventTypeForm";

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

  return (
    <div className="max-w-4xl mx-auto">
      <EventTypeForm initialData={event} />
    </div>
  );
}