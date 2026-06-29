import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Plus, Users, Clock, Gift, Heart, Trophy, Music } from "lucide-react";

const typeIcons: Record<string, any> = {
  ANNIVERSAIRE: Gift,
  MARIAGE: Heart,
  SOUTENANCE: Trophy,
  AUTRE: Music,
};

// Type pour les événements avec relations
type EventWithRelations = {
  id: string;
  title: string;
  type: string;
  date: Date;
  time: string;
  location: string;
  imageUrl: string | null;
  slug: string;
  userId: string;
  guests: any[];
  collaborators: any[];
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  // Récupérer les événements
  const events = (await prisma.event.findMany({
    where: {
      OR: [
        { userId },
        { collaborators: { some: { userId } } },
      ],
    },
    include: {
      guests: true,
      collaborators: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })) as EventWithRelations[];

  if (events.length === 0) {
    redirect("/dashboard/event/new");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Mes événements
          </h1>
          <Link
            href="/dashboard/event/new"
            className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 sm:px-6 py-3 rounded-xl transition w-full sm:w-auto text-sm sm:text-base"
          >
            <Plus size={20} />
            Créer un événement
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {events.map((event) => {
            const Icon = typeIcons[event.type] || Calendar;
            const isOwner = event.userId === userId;
            const collabCount = event.collaborators.length;

            return (
              <Link
                key={event.id}
                href={`/dashboard/${event.slug}`}
                className="group bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-800"
              >
                {event.imageUrl && (
                  <div className="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary-500">
                      <Icon size={18} />
                      <span className="text-sm font-medium">{event.type}</span>
                    </div>
                    {!isOwner && (
                      <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        Collaborateur
                      </span>
                    )}
                    {isOwner && collabCount > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        {collabCount} collab.
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors mt-1">
                    {event.title}
                  </h3>
                  <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>{event.guests.length} invités</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-primary-500 font-medium text-sm">
                    Gérer l'événement →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}