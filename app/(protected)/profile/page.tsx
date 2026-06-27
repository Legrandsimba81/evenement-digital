import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Calendar, Mail, User, Users } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      events: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Mon profil</h1>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-6 mb-8">
        <div className="flex items-start gap-6">
          <div className="h-20 w-20 rounded-full bg-primary-500/15 flex items-center justify-center text-3xl font-bold text-primary-500">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {user.name || "Utilisateur"}
            </h2>
            <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>Rôle : {user.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Membre depuis le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Mes derniers événements</h3>
        {user.events.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Vous n'avez pas encore créé d'événement.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {user.events.map((event) => (
              <li key={event.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {event.type} • {new Date(event.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Link
                  href={`/dashboard/${event.slug}`}
                  className="text-primary-500 hover:text-primary-600 text-sm"
                >
                  Gérer →
                </Link>
              </li>
            ))}
          </ul>
        )}
        {user.events.length > 0 && (
          <div className="mt-4 text-center">
            <Link href="/dashboard" className="text-primary-500 hover:underline text-sm">
              Voir tous mes événements
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}