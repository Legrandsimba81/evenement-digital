"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { themes, getThemesByCategory, getDefaultTheme, Theme } from "@/lib/themes";
import { Check, Sparkles } from "lucide-react";
import ThemePreview from "./ThemePreview";

type EventType = "ANNIVERSAIRE" | "MARIAGE" | "SOUTENANCE" | "AUTRE";

export default function ThemeSelector({ 
  type, 
  returnTo 
}: { 
  type: EventType; 
  returnTo?: string;
}) {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<string>(getDefaultTheme(type));
  const availableThemes = getThemesByCategory(type);

  const handleSelect = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  const handleContinue = () => {
    if (returnTo) {
      // Rediriger vers returnTo avec le thème en paramètre
      const url = new URL(returnTo, window.location.origin);
      url.searchParams.set("theme", selectedTheme);
      window.location.href = url.toString();
    } else {
      router.push(`/dashboard/event/new/${type}?theme=${selectedTheme}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Choisissez le thème de votre invitation
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Sélectionnez l'apparence qui correspond à votre événement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {availableThemes.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              className={`group relative rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                isSelected
                  ? "border-primary-500 shadow-xl ring-2 ring-primary-500 ring-offset-2"
                  : "border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-md"
              } bg-white dark:bg-gray-900`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
              <div className="p-4">
                <ThemePreview theme={theme} />
              </div>
              <div className="p-4 text-left border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {theme.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {theme.description}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`inline-block h-3 w-3 rounded-full bg-${theme.colors.primary}`}></span>
                  <span className={`inline-block h-3 w-3 rounded-full bg-${theme.colors.secondary}`}></span>
                  <span className={`inline-block h-3 w-3 rounded-full bg-${theme.colors.accent}`}></span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {theme.animation === "none" ? "Statique" : `✨ ${theme.animation}`}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          onClick={handleContinue}
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl transition text-lg font-medium"
        >
          <Sparkles size={20} />
          {returnTo ? "Sélectionner ce thème" : "Continuer avec ce thème"}
        </button>
      </div>
    </div>
  );
}