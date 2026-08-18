// app/(protected)/dashboard/shops/[slug]/reservations/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ShopReservationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;
    const session = await auth();
    if (!session?.user) redirect("/login");

    const shop = await prisma.shop.findUnique({
      where: { slug },
      include: { user: true },
    });
    if (!shop) return notFound();
    if (shop.userId !== session.user.id && session.user.role !== "ADMIN") {
      return (
        <div className="p-6 text-center">
          <p className="text-red-500">Vous n'êtes pas autorisé à voir ces réservations.</p>
        </div>
      );
    }

    const reservations = await prisma.reservation.findMany({
      where: { shopId: shop.id },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    const formatDate = (date: Date) =>
      new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);

    const getStatusBadge = (status: string) => {
      const classes = {
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        accepted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      };
      const labels = {
        pending: "En attente",
        accepted: "Acceptée",
        rejected: "Refusée",
      };
      return {
        className: classes[status as keyof typeof classes] || classes.pending,
        label: labels[status as keyof typeof labels] || "En attente",
      };
    };

    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href={`/dashboard/shops/${shop.slug}`}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft size={16} /> Retour
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Réservations - {shop.name}
          </h1>
        </div>

        {reservations.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-400" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Aucune réservation pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((res) => {
              const { className, label } = getStatusBadge(res.status);
              return (
                <div
                  key={res.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <User size={18} className="text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {res.clientName || res.user?.name || "Client"}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({formatDate(res.createdAt)})
                        </span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
                          {label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                        {res.clientEmail && (
                          <span className="flex items-center gap-1">
                            <Mail size={14} /> {res.clientEmail}
                          </span>
                        )}
                        {res.clientPhone && (
                          <span className="flex items-center gap-1">
                            <Phone size={14} /> {res.clientPhone}
                          </span>
                        )}
                        {res.clientWhatsapp && (
                          <span className="flex items-center gap-1">
                            <Phone size={14} className="text-green-500" /> {res.clientWhatsapp}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> {formatDate(res.date)}
                        </span>
                      </div>
                      {res.message && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                          <MessageSquare size={14} className="inline mr-1" />
                          {res.message}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {/* Boutons pour changer le statut (admin ou propriétaire) */}
                      <form action={`/api/reservations/${res.id}/status`} method="POST">
                        <input type="hidden" name="status" value="accepted" />
                        <button
                          type="submit"
                          className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 transition"
                          title="Accepter"
                        >
                          <CheckCircle size={18} />
                        </button>
                      </form>
                      <form action={`/api/reservations/${res.id}/status`} method="POST">
                        <input type="hidden" name="status" value="rejected" />
                        <button
                          type="submit"
                          className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 transition"
                          title="Refuser"
                        >
                          <XCircle size={18} />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("[ShopReservationsPage] Erreur:", error);
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Erreur</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Impossible de charger les réservations.
        </p>
        <Link href="/dashboard/shops" className="mt-4 inline-block text-blue-600 hover:underline">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }
}