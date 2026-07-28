import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  MessageSquare,
  User,
  Mail,
  Eye,
  CalendarDays,
  Shield,
  Clock,
  Phone,
  X,
} from "lucide-react";
import DeleteEventButton from "@/components/admin/DeleteEventButton";
import UserAdminControls from "@/components/admin/UserAdminControls";
import AdminSearch from "@/components/admin/AdminSearch";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { userSearch?: string; eventSearch?: string };
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const userSearch = searchParams.userSearch?.trim() || "";
  const eventSearch = searchParams.eventSearch?.trim() || "";

  // Filtres utilisateurs avec typage explicite
  const userWhere: Prisma.UserWhereInput = userSearch
    ? {
        OR: [
          { name: { contains: userSearch, mode: "insensitive" } },
          { email: { contains: userSearch, mode: "insensitive" } },
          { phone: { contains: userSearch, mode: "insensitive" } },
        ],
      }
    : {};

  // Filtres événements avec typage explicite
  const eventWhere: Prisma.EventWhereInput = eventSearch
    ? {
        OR: [
          { title: { contains: eventSearch, mode: "insensitive" } },
          { location: { contains: eventSearch, mode: "insensitive" } },
          { type: { contains: eventSearch, mode: "insensitive" } },
          { user: { name: { contains: eventSearch, mode: "insensitive" } } },
          { user: { email: { contains: eventSearch, mode: "insensitive" } } },
        ],
      }
    : {};

  // Requêtes
  const [users, events] = await Promise.all([
    prisma.user.findMany({
      where: userWhere,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        canCreateEvents: true,
        createdAt: true,
      },
    }),
    prisma.event.findMany({
      where: eventWhere,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        guests: true,
        messages: true,
      },
    }),
  ]);

  // Récupérer les comptes Google
  const usersWithAccounts = await prisma.user.findMany({
    where: { id: { in: users.map((u) => u.id) } },
    include: { accounts: true },
  });
  const userMap = new Map(usersWithAccounts.map((u) => [u.id, u.accounts.length > 0]));

  // Calculs pour les statistiques
  const totalMessages = events.reduce((acc, e) => acc + e.messages.length, 0);
  const totalGuests = events.reduce((acc, e) => acc + e.guests.length, 0);

  const stats = [
    { label: "Utilisateurs", value: users.length, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Événements", value: events.length, icon: Calendar, color: "from-green-500 to-green-600" },
    { label: "Messages", value: totalMessages, icon: MessageSquare, color: "from-purple-500 to-purple-600" },
    { label: "Invités", value: totalGuests, icon: User, color: "from-orange-500 to-orange-600" },
  ];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="text-purple-600 dark:text-purple-400" size={28} />
              Administration
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gérez les utilisateurs et les événements de la plateforme
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-0">
            <Clock size={16} />
            <span>Données en temps réel</span>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4 hover:shadow-md transition"
              >
                <div
                  className={`h-12 w-12 rounded-full bg-gradient-to-br ${stat.color} bg-opacity-10 flex items-center justify-center text-white`}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filtres */}
        <AdminSearch userSearch={userSearch} eventSearch={eventSearch} />

        {/* Tableaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Utilisateurs */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                Utilisateurs
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({users.length})
                </span>
              </h2>
              {userSearch && (
                <Link
                  href="/admin"
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                >
                  <X size={14} /> Réinitialiser
                </Link>
              )}
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[500px]">
              {users.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">Aucun utilisateur trouvé</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                    <tr>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Utilisateur</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Téléphone</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Rôle</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Statut</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const isGoogle = userMap.get(user.id) || false;
                      return (
                        <tr
                          key={user.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                        >
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {user.name || "Anonyme"}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Mail size={12} />
                                {user.email}
                                {isGoogle && (
                                  <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-[10px] font-medium">
                                    Google
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                                <CalendarDays size={12} />
                                {formatDate(user.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {user.phone ? (
                              <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                <Phone size={12} />
                                {user.phone}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === "ADMIN"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              {user.role === "ADMIN" && <Shield size={12} />}
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.canCreateEvents
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              {user.canCreateEvents ? "Actif" : "Bloqué"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <UserAdminControls
                              userId={user.id}
                              currentRole={user.role}
                              currentStatus={user.canCreateEvents}
                              userName={user.name || ""}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Événements */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar size={18} className="text-green-500" />
                Événements
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({events.length})
                </span>
              </h2>
              {eventSearch && (
                <Link
                  href="/admin"
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                >
                  <X size={14} /> Réinitialiser
                </Link>
              )}
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[500px]">
              {events.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">Aucun événement trouvé</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                    <tr>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Événement</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Organisateur</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Infos</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr
                        key={event.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                      >
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">{event.title}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {event.type} • {event.location || "Lieu non spécifié"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="text-gray-900 dark:text-white">{event.user.name || "Anonyme"}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{event.user.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                              <Users size={12} /> {event.guests.length}
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                              <MessageSquare size={12} /> {event.messages.length}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/invitation/${event.slug}`}
                              target="_blank"
                              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition text-blue-500 hover:text-blue-700"
                              title="Voir l'invitation"
                            >
                              <Eye size={16} />
                            </Link>
                            <DeleteEventButton slug={event.slug} title={event.title} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}