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
  let planColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50";
  let planIcon = <Users className="w-4 h-4" />;

  if (eventLimit === null) {
    planLabel = "Illimité";
    planColor = "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800/50";
  } else if (eventLimit > 50) {
    planLabel = "Premium (50+)";
    planColor = "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800/50";
  } else if (eventLimit > 5) {
    planLabel = `Standard (${eventLimit} invités)`;
    planColor = "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/50";
  } else {
    planLabel = "Gratuit (5 invités)";
    planColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50";
  }

  let themeString = null;
  if (event.theme) {
    try {
      themeString = typeof event.theme === "string" ? event.theme : JSON.stringify(event.theme);
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
    <div className="space-y-4">
      {/* Alerte événement passé */}
      {isPast && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-gray-100 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl p-3.5 flex items-center gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <Calendar size={18} className="text-gray-500 shrink-0" />
            <span>
              Cet événement a eu lieu le <strong>{new Date(event.date).toLocaleDateString("fr-FR")}</strong>.
            </span>
          </div>
        </div>
      )}

      {/* Affichage du plan */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${planColor}`}>
              {planIcon}
              Plan : {planLabel}
            </div>
          </div>
          {eventLimit !== null && eventLimit <= 5 && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <AlertCircle size={14} className="text-amber-500 shrink-0" />
              <span>
                Plan gratuit (5 invités max). Pour débloquer plus d'invités, veuillez consulter nos tarifs.
              </span>
            </div>
          )}
        </div>
      </div>

      <EventDetailsClient event={eventData} />
    </div>
  );
}