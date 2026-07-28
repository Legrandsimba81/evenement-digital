import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  MessageSquare,
  User,
  Mail,
  Eye,
  Trash2,
  CalendarDays,
  UserCheck,
  Shield,
  Clock,
} from "lucide-react";
import DeleteEventButton from "@/components/admin/DeleteEventButton";
import UserAdminControls from "@/components/admin/UserAdminControls";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [users, events] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        canCreateEvents: true,
        createdAt: true,
        // on pourrait aussi compter les événements de chaque user
      },
    }),
    prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        guests: true,
        messages: true,
      },
    }),
  ]);

  // Vérifier si un utilisateur a un mot de passe (indicateur Google)
  // On va récupérer les comptes liés à chaque user (via Prisma)
  // Pour simplifier, on suppose que si le champ password est null, c'est un compte Google.
  // Mais on n'a pas récupéré password. On va faire une requête supplémentaire pour les comptes.
  // On peut récupérer les accounts dans la même requête :
  const usersWithAccounts = await prisma.user.findMany({
    where: { id: { in: users.map(u => u.id) } },
    include: { accounts: true },
  });
  const userMap = new Map(usersWithAccounts.map(u => [u.id, u.accounts.length > 0]));

  const totalMessages = events.reduce((acc, e) => acc + e.messages.length, 0);
  const totalGuests = events.reduce((acc, e) => acc + e.guests.length, 0);

  const stats = [
    { label: "Utilisateurs", value: users.length, icon: Users, color: "bg-blue-500", textColor: "text-blue-700" },
    { label: "Événements", value: events.length, icon: Calendar, color: "bg-green-500", textColor: "text-green-700" },
    { label: "Messages", value: totalMessages, icon: MessageSquare, color: "bg-purple-500", textColor: "text-purple-700" },
    { label: "Invités", value: totalGuests, icon: User, color: "bg-orange-500", textColor: "text-orange-700" },
  ];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tableau de bord administrateur
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock size={16} />
            <span>Mise à jour en temps réel</span>
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Vue d’ensemble et gestion des données de la plateforme
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between hover:shadow-lg transition"
              >
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div
                  className={`h-12 w-12 rounded-full ${stat.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center`}
                >
                  <Icon size={24} className={stat.textColor} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tableaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Utilisateurs */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users size={20} className="text-blue-500" />
              Derniers utilisateurs
              <span className="ml-auto text-sm font-normal text-gray-500 dark:text-gray-400">
                {users.length} au total
              </span>
            </h2>
            {users.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6">Aucun utilisateur</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Utilisateur</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Rôle</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Statut</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const isGoogle = userMap.get(user.id) || false;
                      return (
                        <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                          <td className="py-3 px-2">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {user.name || "Anonyme"}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Mail size={12} />
                                {user.email}
                                {isGoogle && (
                                  <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-[10px] font-semibold">
                                    Google
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                                <CalendarDays size={12} />
                                Membre depuis le {formatDate(user.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                user.role === "ADMIN"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              {user.role === "ADMIN" ? <Shield size={12} /> : null}
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                user.canCreateEvents
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              {user.canCreateEvents ? "✅ Actif" : "❌ Bloqué"}
                            </span>
                          </td>
                          <td className="py-3 px-2">
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
              </div>
            )}
          </div>

          {/* Événements */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-green-500" />
              Derniers événements
              <span className="ml-auto text-sm font-normal text-gray-500 dark:text-gray-400">
                {events.length} au total
              </span>
            </h2>
            {events.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6">Aucun événement</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Événement</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Organisateur</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Infos</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 10).map((event) => (
                      <tr key={event.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <td className="py-3 px-2">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">{event.title}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {event.type} • {event.location || "Lieu non spécifié"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex flex-col">
                            <span className="text-gray-900 dark:text-white">{event.user.name || "Anonyme"}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{event.user.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              👤 {event.guests.length} invités
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              💬 {event.messages.length} messages
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/invitation/${event.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition text-blue-500 hover:text-blue-700"
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
                {events.length > 10 && (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    + {events.length - 10} autres événements
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}