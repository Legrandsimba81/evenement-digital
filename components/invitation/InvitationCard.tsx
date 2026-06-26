import { Calendar, MapPin, Clock } from "lucide-react";

export default function InvitationCard({
  event,
  guestName,
  guestTitle,
}: {
  event: any;
  guestName: string;
  guestTitle?: string;
}) {
  const fullName = guestTitle ? `${guestTitle} ${guestName}` : guestName;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
      {event.imageUrl && (
        <div className="h-72 overflow-hidden">
          <img
            src={event.imageUrl}
            alt="Événement"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Bonjour <span className="text-primary-500">{fullName}</span>
        </h1>

        {event.invitationText && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-l-4 border-primary-500">
            <p className="text-gray-800 dark:text-gray-200 italic text-lg">
              {event.invitationText}
            </p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Calendar size={20} className="text-primary-500" />
            <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Clock size={20} className="text-primary-500" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <MapPin size={20} className="text-primary-500" />
            <span>{event.location}</span>
          </div>
        </div>

        {event.program && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📅 Programme</h3>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {event.program}
            </div>
          </div>
        )}

        {event.description && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}