// app/(protected)/admin/events/page.tsx (version avec modifications)

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  MessageSquare,
  Eye,
  Search,
} from "lucide-react";
import DeleteEventButton from "@/components/admin/DeleteEventButton";
import TogglePaidButton from "@/components/admin/TogglePaidButton"; // ✅ Ajout

export const dynamic = "force-dynamic";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const search = searchParams.search?.trim() || "";

  const where: Prisma.EventWhereInput = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
          { type: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      }
    : {};

  const events = await prisma.event.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      guests: true,
      messages: true,
    },
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <div>
      {/* ... en-tête et formulaire de recherche ... */}

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-150">
          {events.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Aucun événement trouvé
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                <tr>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">
                    Événement
                  </th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">
                    Organisateur
                  </th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">
                    Infos
                  </th>
                  <th className="text-center py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">
                    Statut
                  </th>
                  <th className="text-center py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">
                    Actions
                  </th>
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
                        <span className="font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {event.type} • {event.location || "Lieu non spécifié"} •{" "}
                          {formatDate(event.date)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white">
                          {event.user.name || "Anonyme"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {event.user.email}
                        </span>
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
                    <td className="py-3 px-3 text-center">
                      <TogglePaidButton slug={event.slug} initialIsPaid={event.isPaid} />
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
  );
}