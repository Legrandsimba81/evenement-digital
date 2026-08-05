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
    <div className="space-y-5">
      <header className="rounded-3xl border border-white/10 bg-linear-to-r from-sky-500/10 via-slate-800 to-violet-500/10 p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">Vue d’ensemble</p>
            <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">Tableau de bord</h1>
            <p className="mt-1 text-sm text-slate-300">Suivi rapide de l’activité, des utilisateurs et des événements.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
            <span className="block text-xs uppercase tracking-[0.22em] text-slate-400">Admin connecté</span>
            <span className="font-semibold text-white">{session.user.name || session.user.email}</span>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group min-w-0 rounded-2xl border border-white/10 bg-slate-800/80 p-4 shadow-lg shadow-slate-950/25 transition duration-200 hover:-translate-y-0.5 hover:border-sky-400/50 hover:bg-slate-800"
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${stat.color} text-white shadow-lg`}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                  <p className="mt-1 break-all text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-800/80 p-4 shadow-lg shadow-slate-950/20">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Derniers utilisateurs</h2>
            <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm font-medium text-sky-300 hover:text-sky-200">
              Voir tous <ArrowRight size={14} />
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun utilisateur</p>
          ) : (
            <ul className="space-y-3">
              {recentUsers.map((user) => (
                <li key={user.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900/70 px-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{user.name || "Anonyme"}</p>
                    <p className="truncate text-sm text-slate-400">{user.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{formatDate(user.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-800/80 p-4 shadow-lg shadow-slate-950/20">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Derniers événements</h2>
            <Link href="/admin/events" className="inline-flex items-center gap-1 text-sm font-medium text-sky-300 hover:text-sky-200">
              Voir tous <ArrowRight size={14} />
            </Link>
          </div>

          {recentEvents.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun événement</p>
          ) : (
            <ul className="space-y-3">
              {recentEvents.map((event) => (
                <li key={event.id} className="rounded-2xl bg-slate-900/70 px-3 py-3">
                  <p className="truncate font-medium text-white">{event.title}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {event.user.name || "Anonyme"} • {formatDate(event.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}