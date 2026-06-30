"use client";

import { Theme } from "@/lib/themes";
import { Calendar, MapPin, Clock, User, Users } from "lucide-react";

interface ThemePreviewProps {
  theme: Theme;
}

export default function ThemePreview({ theme }: ThemePreviewProps) {
  const Icon = theme.icons.main;
  const primaryColor = `text-${theme.colors.primary}`;
  const bgClass = theme.className || "bg-white";

  // Données fictives pour l'aperçu
  const dummyData = {
    title: theme.category === "MARIAGE" ? "Mariage de Jean & Marie" :
            theme.category === "ANNIVERSAIRE" ? "Anniversaire de Sarah" :
            theme.category === "SOUTENANCE" ? "Soutenance de thèse" :
            "Événement spécial",
    guestName: "Martin Dupont",
    date: "24 juin 2025",
    time: "18:00",
    location: "Espace Koffi, Abidjan",
    program: "18h00 - Accueil des invités\n19h00 - Cérémonie\n20h30 - Cocktail",
  };

  return (
    <div className={`${bgClass} rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700`}>
      {/* Header avec icône et type */}
      <div className={`p-3 flex items-center justify-between bg-${theme.colors.primary}/10`}>
        <div className="flex items-center gap-2">
          <Icon size={16} className={primaryColor} />
          <span className={`text-xs font-semibold ${primaryColor}`}>
            {theme.category}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {theme.invitationTitle || "Invitation"}
        </span>
      </div>

      {/* Corps de l'aperçu */}
      <div className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">
            {dummyData.guestName.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-800 dark:text-white line-clamp-1">
              {dummyData.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {dummyData.guestName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar size={10} className={primaryColor} />
            <span>{dummyData.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={10} className={primaryColor} />
            <span>{dummyData.time}</span>
          </div>
          <div className="flex items-center gap-1 col-span-2">
            <MapPin size={10} className={primaryColor} />
            <span className="truncate">{dummyData.location}</span>
          </div>
        </div>

        <div className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded p-1.5 whitespace-pre-line line-clamp-2">
          {dummyData.program}
        </div>

        <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
          <span className="text-[10px] text-gray-400">1 personne</span>
          <span className="text-[10px] text-primary-500 font-medium">Voir →</span>
        </div>
      </div>
    </div>
  );
}