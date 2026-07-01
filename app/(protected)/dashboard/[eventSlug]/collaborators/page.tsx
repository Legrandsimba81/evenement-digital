import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CollaboratorManager from "@/components/events/CollaboratorManager";
import { canManageEvent } from "@/lib/permissions";

export default async function CollaboratorsPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { eventSlug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: { user: true },
  });

  if (!event) redirect("/dashboard");

  const isOwner = event.userId === session.user.id;
  // ✅ Vérifier que l'ID existe avant de l'utiliser
  const hasAccess = session.user.id 
    ? await canManageEvent(event.id, session.user.id) 
    : false;
    
  if (!isOwner && !hasAccess) redirect("/dashboard");

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Collaborateurs – {event.title}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Gérez les personnes ayant accès à cet événement.
      </p>
      <CollaboratorManager
        eventId={event.id}
        eventSlug={event.slug}
        isOwner={isOwner}
      />
    </div>
  );
}