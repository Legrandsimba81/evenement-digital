import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { 
  Calendar, Clock, MapPin, ExternalLink, CreditCard, 
  Phone, Mail, AlertCircle, Heart 
} from "lucide-react";
import DownloadFairePartButton from "@/components/faire-part/DownloadFairePartButton";
import FairePartActions from "@/components/faire-part/FairePartActions";

interface Props {
  params: { slug: string };
}

export default async function PublicFairePartPage({ params }: Props) {
  const fairePart = await prisma.fairePart.findUnique({
    where: { slug: params.slug },
  });

  if (!fairePart) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.octaviaevent.com";
  const fairePartUrl = `${baseUrl}/faire-part/${fairePart.slug}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 flex justify-center items-center">
      <div 
        id="faire-part-card" 
        className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        {fairePart.imageUrl && (
          <div className="w-full h-64 overflow-hidden">
            <img
              src={fairePart.imageUrl}
              alt={fairePart.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-10 space-y-8 text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              <Heart size={14} /> Faire-Part de Mariage
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              {fairePart.groomName} <span className="text-indigo-600">&</span> {fairePart.brideName}
            </h1>
          </div>

          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic">
            "{fairePart.announcementText}"
          </p>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl space-y-3 text-left border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm">
              <Calendar className="text-indigo-600 flex-shrink-0" size={18} />
              <span>
                <strong>Date :</strong> {new Date(fairePart.eventDate).toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm">
              <Clock className="text-indigo-600 flex-shrink-0" size={18} />
              <span>
                <strong>Heure :</strong> {fairePart.eventTime}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm">
              <MapPin className="text-indigo-600 flex-shrink-0" size={18} />
              <span>
                <strong>Lieu :</strong> {fairePart.locationName}
              </span>
            </div>

            {fairePart.mapsUrl && (
              <div className="pt-2">
                <a
                  href={fairePart.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-2 rounded-lg transition"
                >
                  <MapPin size={14} /> Voir le lieu sur Google Maps <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>

          {(fairePart.rsvpDeadline || fairePart.invitationLink) && (
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-6 rounded-2xl space-y-3 text-left border border-indigo-100 dark:border-indigo-900/40">
              <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                Confirmation de présence
              </h3>
              {fairePart.rsvpDeadline && (
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  ⏳ Veuillez répondre avant le : <strong>{new Date(fairePart.rsvpDeadline).toLocaleDateString("fr-FR")}</strong>
                </p>
              )}
              {fairePart.invitationLink && (
                <a
                  href={fairePart.invitationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition"
                >
                  <ExternalLink size={14} /> Répondre à l'invitation
                </a>
              )}
            </div>
          )}

          {fairePart.mobileMoneyNumber && (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-6 rounded-2xl text-left border border-emerald-100 dark:border-emerald-900/40 space-y-2">
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <CreditCard size={16} /> Contribution Mobile Money
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Numéro : <strong>{fairePart.mobileMoneyNumber}</strong>
              </p>
              {fairePart.mobileMoneyName && (
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Nom du compte : <strong>{fairePart.mobileMoneyName}</strong>
                </p>
              )}
            </div>
          )}

          {(fairePart.contactPhone || fairePart.contactEmail) && (
            <div className="text-left space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contacts</h4>
              <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
                {fairePart.contactPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} className="text-indigo-500" />
                    <span>{fairePart.contactPhone}</span>
                  </div>
                )}
                {fairePart.contactEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} className="text-indigo-500" />
                    <span>{fairePart.contactEmail}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {fairePart.importantNote && (
            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl text-left border border-amber-200 dark:border-amber-800 flex items-start gap-3">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
              <div className="text-xs text-amber-800 dark:text-amber-300">
                <strong>Note importante :</strong> {fairePart.importantNote}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <FairePartActions fairePartUrl={fairePartUrl} title={fairePart.title} />
            <DownloadFairePartButton 
              targetId="faire-part-card" 
              fileName={`Faire-Part-${fairePart.slug}`} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}