import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";

type Event = {
  id: string;
  title: string;
  type: string;
  date: Date;
  slug: string;
};

interface ProfileEventsCardProps {
  events: Event[];
  formatDate: (date: Date) => string;
}

export function ProfileEventsCard({ events, formatDate }: ProfileEventsCardProps) {
  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Users size={18} className="text-blue-500" />
          Mes derniers événements
        </h3>
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
        >
          Voir tout <ChevronRight size={16} />
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">Vous n'avez pas encore créé d'événement.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {events.map((event) => (
            <li key={event.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {event.type} • {formatDate(event.date)}
                </p>
              </div>
              <Link
                href={`/dashboard/${event.slug}`}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1"
              >
                Gérer
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}