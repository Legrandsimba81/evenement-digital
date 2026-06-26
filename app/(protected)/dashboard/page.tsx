import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Plus, Users, Clock } from "lucide-react";

export const dynamic = 'force-dynamic'
export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const eventsCount = await prisma.event.count({
    where: { userId },
  });

  if (eventsCount === 0) {
    redirect("/dashboard/event/new");
  }

  const events = await prisma.event.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Calcul du nombre d'événements à venir
  const upcomingEvents = events.filter((e: any) => new Date(e.date) > new Date()).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mes événements
          </h1>
          <Link
            href="/dashboard/event/new"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl transition"
          >
            <Plus size={20} />
            Créer un événement
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total événements</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{events.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Événements à venir</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{upcomingEvents}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total invités</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {events.reduce((acc: number, e: any) => acc + (e.guests?.length || 0), 0)}
            </p>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Aucun événement pour le moment. Commencez par en créer un !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <Link
                key={event.id}
                href={`/dashboard/${event.slug}`}
                className="group bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-800"
              >
                {event.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
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
                      <span>{event.type}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-primary-500 font-medium text-sm">
                    Gérer l'événement →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}