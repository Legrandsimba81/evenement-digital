import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EventDetailsClient from "@/components/EventDetailsClient";
import { Calendar, Users, AlertCircle } from "lucide-react";
import { canManageEvent } from "@/lib/permissions";

export const dynamic = "force-dynamic";

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

  if (!event) return notFound();

  const hasAccess = await canManageEvent(event.id, userId);
  if (!hasAccess) return notFound();

  const isPast = new Date(event.date) < new Date();

  // Récupérer l'utilisateur avec ses limites
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { eventLimits: true },
  });

  const limits = user?.eventLimits as Record<string, number | null> | null;
  const eventLimit = limits?.[event.type] ?? 5; // 5 par défaut

  // Déterminer le plan
  let planLabel = "Gratuit";
  let planColor = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  let planIcon = <Users className="w-4 h-4" />;

  if (eventLimit === null) {
    planLabel = "Illimité";
    planColor = "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
  } else if (eventLimit > 50) {
    planLabel = "Premium (50+)";
    planColor = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  } else if (eventLimit > 5) {
    planLabel = `Standard (${eventLimit} invités)`;
    planColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
  } else {
    planLabel = "Gratuit (5 invités)";
    planColor = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  }

  let themeString = null;
  if (event.theme) {
    try {
      themeString = typeof event.theme === 'string' ? event.theme : JSON.stringify(event.theme);
    } catch {
      themeString = null;
    }
  }

  const eventData = {
    ...event,
    date: event.date.toISOString(),
    theme: themeString,
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

      {/* Affichage du plan */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${planColor}`}>
          {planIcon}
          Plan : {planLabel}
        </div>
        {eventLimit !== null && eventLimit <= 5 && (
          <div className="mt-2 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <AlertCircle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
            <p>
              Vous êtes sur le plan gratuit (5 invités maximum). Pour plus d'invités, contactez l'administration.
            </p>
          </div>
        )}
      </div>

      <EventDetailsClient event={eventData} />
    </>
  );
}