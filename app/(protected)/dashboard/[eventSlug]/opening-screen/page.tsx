"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Check, Sparkles, Eye } from "lucide-react";
import Link from "next/link";

const OPENING_OPTIONS = [
  {
    id: "classic-gold",
    name: "Doré & Luxe Classique",
    description: "Convient aux mariages, galas et soirées de prestige.",
    previewColor: "from-amber-700 via-amber-900 to-amber-950",
  },
  {
    id: "wedding-rose",
    name: "Rose Éléganterie",
    description: "Idéal pour les mariages romantiques et réceptions intimes.",
    previewColor: "from-rose-700 via-rose-900 to-rose-950",
  },
  {
    id: "royal-blue",
    name: "Bleu Nuit VIP",
    description: "Parfait pour soutenances, lancements et billetteries VIP.",
    previewColor: "from-slate-800 via-blue-950 to-slate-900",
  },
];

export default function SelectOpeningScreenPage() {
  const router = useRouter();
  const params = useParams();
  
  // Sécurisation de la récupération du slug
  const slug = params?.slug as string;

  const [selected, setSelected] = useState<string>("classic-gold");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!slug || slug === "undefined") {
      alert("Erreur : Identifiant de l'événement introuvable.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}/opening-screen`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openingScreen: selected }),
      });

      if (res.ok) {
        router.push(`/dashboard/event/${slug}`);
      } else {
        const data = await res.json();
        alert(data?.error || "Erreur lors de la sauvegarde.");
      }
    } catch {
      alert("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  if (!slug) {
    return (
      <div className="p-8 text-center text-gray-500">
        Chargement des paramètres...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/event/${slug}`}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Écran d'ouverture dynamique
          </h1>
          <p className="text-sm text-gray-500">
            Choisissez l'animation d'ouverture qui s'affichera au clic de l'invité.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {OPENING_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <div
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative flex flex-col justify-between ${
                isSelected
                  ? "border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 shadow-md"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300"
              }`}
            >
              <div>
                <div
                  className={`w-full aspect-[4/3] rounded-xl bg-gradient-to-r ${option.previewColor} relative overflow-hidden flex items-center justify-between p-2 shadow-inner`}
                >
                  <div className="w-[48%] h-full bg-white/10 rounded-lg border-r border-white/20" />
                  <div className="w-[48%] h-full bg-white/10 rounded-lg border-l border-white/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs shadow-lg">
                      <Sparkles size={14} />
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white mt-4">
                  {option.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                  <Eye size={14} /> Prévisualiser
                </span>
                {isSelected && (
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check size={14} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition shadow-lg disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Appliquer cet écran"}
        </button>
      </div>
    </div>
  );
}