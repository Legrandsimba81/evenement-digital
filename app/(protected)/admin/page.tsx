import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Users, MessageSquare, User, Mail, Eye, Trash2 } from "lucide-react";
import DeleteEventButton from "@/components/admin/DeleteEventButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [users, events, messages] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        guests: true,
        messages: true,
      },
    }),
    prisma.message.count(),
  ]);

  const totalMessages = events.reduce((acc, e) => acc + e.messages.length, 0);
  const totalGuests = events.reduce((acc, e) => acc + e.guests.length, 0);

  const stats = [
    { label: "Utilisateurs", value: users.length, icon: Users, color: "bg-blue-500", textColor: "text-blue-700" },
    { label: "Événements", value: events.length, icon: Calendar, color: "bg-green-500", textColor: "text-green-700" },
    { label: "Messages", value: totalMessages, icon: MessageSquare, color: "bg-purple-500", textColor: "text-purple-700" },
    { label: "Invités", value: totalGuests, icon: User, color: "bg-orange-500", textColor: "text-orange-700" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tableau de bord administrateur</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Vue d’ensemble et gestion des données de la plateforme</p>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-full ${stat.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center`}>
                  <Icon size={24} className={stat.textColor} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Sections : Utilisateurs et Événements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Utilisateurs */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users size={20} className="text-blue-500" />
              Derniers utilisateurs
            </h2>
            {users.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6">Aucun utilisateur</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.slice(0, 10).map((user) => (
                  <li key={user.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.name || "Anonyme"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Mail size={14} />
                        {user.email}
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {user.role}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Événements */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-green-500" />
              Derniers événements
            </h2>
            {events.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6">Aucun événement</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {events.slice(0, 10).map((event) => (
                  <li key={event.id} className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{event.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {event.type} • {event.location}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Organisé par {event.user.name || event.user.email} • {event.guests.length} invités • {event.messages.length} messages
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Link
                          href={`/dashboard/${event.slug}`}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </Link>
                        <DeleteEventButton slug={event.slug} title={event.title} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}