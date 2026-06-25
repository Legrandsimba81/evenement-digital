import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Calendar, MapPin, Users } from "lucide-react";

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

  // Récupérer le total des invités pour les statistiques
  const totalGuests = await prisma.guest.count({
    where: { event: { userId } },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Tableau de bord
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez tous vos événements depuis un seul endroit.
            </p>
          </div>
          <Link
            href="/dashboard/event/new"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl font-medium transition mt-4 md:mt-0"
          >
            <PlusCircle size={20} />
            Créer un événement
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total événements</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{events.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                <Calendar size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Invités totaux</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalGuests}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                <Users size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Événements à venir</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {events.filter(e => new Date(e.date) > new Date()).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                <MapPin size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Liste des événements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {event.title.charAt(0)}
                  </span>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {event.type}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {new Date(event.date) > new Date() ? "À venir" : "Passé"}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <MapPin size={14} /> {event.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar size={14} /> {new Date(event.date).toLocaleDateString()} à {event.time}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Link
                    href={`/dashboard/${event.slug}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Gérer →
                  </Link>
                  <span className="text-xs text-gray-400">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}