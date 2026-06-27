"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Heart, Trophy, Music, Sparkles } from "lucide-react";

const eventTypes = [
  { id: "ANNIVERSAIRE", label: "Anniversaire", icon: Gift, color: "bg-pink-100 text-pink-600" },
  { id: "MARIAGE", label: "Mariage", icon: Heart, color: "bg-red-100 text-red-600" },
  { id: "SOUTENANCE", label: "Soutenance", icon: Trophy, color: "bg-purple-100 text-purple-600" },
  { id: "AUTRE", label: "Autre", icon: Music, color: "bg-blue-100 text-blue-600" },
];

export default function ChooseEventType() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Choisissez le type d'événement
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Sélectionnez le type d'événement pour personnaliser votre invitation
        </p>
        <div className="grid grid-cols-2 gap-4">
          {eventTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => router.push(`/dashboard/event/new/${type.id}`)}
                className="group p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-800 hover:border-primary-500"
              >
                <div className={`w-12 h-12 rounded-full ${type.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
                  {type.label}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                  Créer une invitation pour un {type.label.toLowerCase()}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}