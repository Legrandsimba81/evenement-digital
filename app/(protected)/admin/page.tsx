// app/(protected)/admin/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Calendar,
  CreditCard,
  Bell,
  User,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Statistiques globales
  const [totalUsers, totalEvents, totalMessages, totalGuests, pendingTransactions] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.message.count(),
    prisma.guest.count(),
    prisma.transaction.count({ where: { status: "pending" } }),
  ]);

  // Derniers utilisateurs (5)
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, createdAt: true },
  });

  // Derniers événements (5)
  const recentEvents = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { user: { select: { name: true, email: true } } },
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const stats = [
    { label: "Utilisateurs", value: totalUsers, icon: Users, href: "/admin/users", color: "from-blue-500 to-blue-600" },
    { label: "Événements", value: totalEvents, icon: Calendar, href: "/admin/events", color: "from-green-500 to-green-600" },
    { label: "Messages", value: totalMessages, icon: MessageSquare, href: "/admin/events", color: "from-purple-500 to-purple-600" },
    { label: "Invités", value: totalGuests, icon: User, href: "/admin/events", color: "from-orange-500 to-orange-600" },
    { label: "Transactions en attente", value: pendingTransactions, icon: CreditCard, href: "/admin/transactions", color: "from-yellow-500 to-yellow-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
        <p className="text-gray-500 dark:text-gray-400">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4 hover:shadow-md transition group"
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
            </Link>
          );
        })}
      </div>

      {/* Derniers utilisateurs et événements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Derniers utilisateurs</h2>
            <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1">
              Voir tous <ArrowRight size={14} />
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun utilisateur</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentUsers.map((user) => (
                <li key={user.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user.name || "Anonyme"}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(user.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Derniers événements</h2>
            <Link href="/admin/events" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1">
              Voir tous <ArrowRight size={14} />
            </Link>
          </div>
          {recentEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun événement</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentEvents.map((event) => (
                <li key={event.id} className="py-2">
                  <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {event.user.name || "Anonyme"} • {formatDate(event.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}