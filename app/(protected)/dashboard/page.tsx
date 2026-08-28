import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Users, 
  Clock, 
  Gift, 
  Heart, 
  Trophy, 
  Music, 
  FileText, 
  ExternalLink,
  CreditCard,
} from "lucide-react";
import DeactivatedMessage from "@/components/ui/DeactivatedMessage";
import DownloadFairePartButton from "@/components/faire-part/DownloadFairePartButton";
import FairePartActions from "@/components/faire-part/FairePartActions";

const typeIcons: Record<string, any> = {
  ANNIVERSAIRE: Gift,
  MARIAGE: Heart,
  SOUTENANCE: Trophy,
  AUTRE: Music,
};

type EventWithRelations = {
  id: string;
  title: string;
  type: string;
  date: Date;
  time: string;
  location: string;
  imageUrl: string | null;
  slug: string;
  userId: string;
  guests: any[];
  collaborators: any[];
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  // ✅ Vérifier le statut de l'utilisateur
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { canCreateEvents: true },
  });
  if (!user?.canCreateEvents) {
    return <DeactivatedMessage />;
  }

  // Récupérer les événements
  const events = (await prisma.event.findMany({
    where: {
      OR: [
        { userId },
        { collaborators: { some: { userId } } },
      ],
    },
    include: {
      guests: true,
      collaborators: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })) as EventWithRelations[];

  // Récupérer les faire-parts
  const faireParts = await prisma.fairePart.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.octaviaevent.com";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Entête avec Boutons de création */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Tableau de bord
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérez vos événements et vos faire-part numériques
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Nouveau Bouton : Créer un faire-part */}
            <Link
              href="/faire-part/new"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-5 py-3 rounded-xl transition w-full sm:w-auto text-sm font-medium"
            >
              <FileText size={18} />
              Créer un faire-part
            </Link>

            {/* Bouton existant : Créer un événement */}
            <Link
              href="/dashboard/event/new"
              className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 sm:px-5 py-3 rounded-xl transition w-full sm:w-auto text-sm font-medium"
            >
              <Plus size={18} />
              Créer un événement
            </Link>
          </div>
        </div>

        {/* SECTION 1 : MES FAIRE-PARTS */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <FileText className="text-indigo-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Mes Faire-Part ({faireParts.length})
            </h2>
          </div>

          {faireParts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl p-8 text-center">
              <FileText className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Aucun faire-part créé pour le moment.
              </p>
              <Link
                href="/faire-part/new"
                className="inline-block mt-4 text-xs font-semibold text-indigo-600 hover:underline"
              >
                + Créer votre premier faire-part
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faireParts.map((fp) => {
                const fpUrl = `${baseUrl}/faire-part/${fp.slug}`;
                const cardId = `faire-part-card-${fp.id}`;

                return (
                  <div
                    key={fp.id}
                    id={cardId}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-indigo-100 dark:border-indigo-950 shadow-md hover:shadow-lg transition p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          Mariage
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(fp.eventDate).toLocaleDateString("fr-FR")}
                        </span>
                      </div>

                      <div className="mt-4 flex items-start gap-4">
                        {fp.imageUrl && (
                          <img
                            src={fp.imageUrl}
                            alt={fp.title}
                            className="w-20 h-20 rounded-xl object-cover border border-gray-100 dark:border-gray-800 flex-shrink-0"
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {fp.groomName} & {fp.brideName}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                            {fp.announcementText}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-indigo-500" />
                          <span>{fp.locationName}</span>
                        </div>
                        {fp.mobileMoneyNumber && (
                          <div className="flex items-center gap-2">
                            <CreditCard size={14} className="text-indigo-500" />
                            <span>Mobile Money: {fp.mobileMoneyNumber} ({fp.mobileMoneyName})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        {/* Actions de partage */}
                        <FairePartActions fairePartUrl={fpUrl} title={fp.title} />

                        {/* Lien de prévisualisation */}
                        <Link
                          href={`/faire-part/${fp.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-indigo-600"
                        >
                          <ExternalLink size={14} /> Voir
                        </Link>
                      </div>

                      {/* Bouton de téléchargement d'image/PDF */}
                      <div>
                        <DownloadFairePartButton 
                          targetId={cardId} 
                          fileName={`Faire-Part-${fp.slug}`} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2 : MES ÉVÉNEMENTS */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-primary-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Mes événements ({events.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((event) => {
              const Icon = typeIcons[event.type] || Calendar;
              const isOwner = event.userId === userId;
              const collabCount = event.collaborators.length;

              return (
                <Link
                  key={event.id}
                  href={`/dashboard/${event.slug}`}
                  className="group bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-800"
                >
                  {event.imageUrl && (
                    <div className="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary-500">
                        <Icon size={18} />
                        <span className="text-sm font-medium">{event.type}</span>
                      </div>
                      {!isOwner && (
                        <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                          Collaborateur
                        </span>
                      )}
                      {isOwner && collabCount > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {collabCount} collab.
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors mt-1">
                      {event.title}
                    </h3>
                    <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>{event.guests.length} invités</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-primary-500 font-medium text-sm">
                      Gérer l'événement →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}