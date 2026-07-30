// app/(protected)/admin/users/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Mail,
  Phone,
  Shield,
  CalendarDays,
  X,
  Search,
} from "lucide-react";
import UserAdminControls from "@/components/admin/UserAdminControls";
import UserLimitsButton from "@/components/admin/UserLimitsButton";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const session = await auth();
  const currentUserIsSuperAdmin = session?.user?.isSuperAdmin || false;
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const search = searchParams.search?.trim() || "";

  // Filtre
  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      canCreateEvents: true,
      createdAt: true,
      isSuperAdmin: true,
      eventLimits: true,
    },
  });

  // Comptes Google
  const usersWithAccounts = await prisma.user.findMany({
    where: { id: { in: users.map((u) => u.id) } },
    include: { accounts: true },
  });
  const userMap = new Map(usersWithAccounts.map((u) => [u.id, u.accounts.length > 0]));

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={24} className="text-blue-500" />
            Utilisateurs
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Gérez les utilisateurs de la plateforme</p>
        </div>
        <div className="text-sm text-gray-500">{users.length} utilisateurs</div>
      </div>

      {/* Barre de recherche */}
      <form method="GET" className="mb-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            placeholder="Rechercher par nom, email ou téléphone..."
            defaultValue={search}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
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
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Limites</th>
                  <th className="text-center py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isGoogle = userMap.get(user.id) || false;
                  const limits = user.eventLimits as Record<string, number | null> | null;
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
                        <UserLimitsButton
                          userId={user.id}
                          currentLimits={limits}
                          userName={user.name || "Utilisateur"}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <UserAdminControls
                          userId={user.id}
                          currentRole={user.role}
                          currentStatus={user.canCreateEvents}
                          userName={user.name || ""}
                          isSuperAdmin={user.isSuperAdmin || false}
                          currentUserIsSuperAdmin={currentUserIsSuperAdmin}
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
    </div>
  );
}