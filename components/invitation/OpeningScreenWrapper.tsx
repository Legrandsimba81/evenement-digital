"use client";

import { useState } from "react";
import { Sparkles, Lock, Unlock } from "lucide-react";

interface OpeningScreenWrapperProps {
  themeId?: string | null;
  guestName: string;
  eventTitle: string;
  children: React.ReactNode;
}

const OPENING_THEMES: Record<string, { name: string; leftImg: string; rightImg: string; bg: string; sealText: string }> = {
  "classic-gold": {
    name: "Doré Classique",
    leftImg: "/opening/gold-left.png",
    rightImg: "/opening/gold-right.png",
    bg: "bg-amber-950",
    sealText: "Ouvrir",
  },
  "wedding-rose": {
    name: "Mariage Rose & Fleurs",
    leftImg: "/opening/gold-left.jpg",
    rightImg: "/opening/gold-right.jpg",
    bg: "bg-rose-950",
    sealText: "Invitation",
  },
  "royal-blue": {
    name: "Bleu Royal & Or",
    leftImg: "/opening/gold-left.jpg",
    rightImg: "/opening/gold-right.jpg",
    bg: "bg-slate-950",
    sealText: "VIP",
  },
};

export default function OpeningScreenWrapper({
  themeId = "classic-gold",
  guestName,
  eventTitle,
  children,
}: OpeningScreenWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullyHidden, setIsFullyHidden] = useState(false);

  // Si aucun thème configuré ou inconnu, afficher directement sans animation
  const theme = OPENING_THEMES[themeId || "classic-gold"] || OPENING_THEMES["classic-gold"];

  const handleOpen = () => {
    setIsOpen(true);
    // Masquer définitivement le DOM de la porte après la fin de la transition (800ms)
    setTimeout(() => {
      setIsFullyHidden(true);
    }, 850);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Contenu principal de l'invitation */}
      <div
        className={`transition-all duration-1000 ease-out transform ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-90 filter blur-[1px]"
        }`}
      >
        {children}
      </div>

      {/* RIDEAU D'OUVERTURE (Double Portes) */}
      {!isFullyHidden && (
        <div className="fixed inset-0 z-50 flex overflow-hidden pointer-events-auto">
          {/* Battant GAUCHE */}
          <div
            style={{ backgroundImage: `url(${theme.leftImg})` }}
            className={`w-1/2 h-full bg-cover bg-right border-r border-amber-500/30 shadow-2xl transition-transform duration-700 ease-in-out ${theme.bg} ${
              isOpen ? "-translate-x-full" : "translate-x-0"
            }`}
          />

          {/* Sceau / Bouton Central */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-4 text-center px-4 transition-all duration-500 ${
              isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
            }`}
          >
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl max-w-sm w-full mx-auto">
              <p className="text-xs uppercase tracking-widest text-amber-200/80 font-medium">
                Invitation personnelle
              </p>
              <h3 className="text-xl font-bold text-white mt-1 line-clamp-1">{guestName}</h3>
              <p className="text-xs text-white/70 mt-1 line-clamp-1">{eventTitle}</p>

              <button
                onClick={handleOpen}
                className="mt-6 w-full py-3 px-6 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transform active:scale-95 transition"
              >
                <Sparkles size={18} />
                <span>{theme.sealText}</span>
              </button>
            </div>
          </div>

          {/* Battant DROIT */}
          <div
            style={{ backgroundImage: `url(${theme.rightImg})` }}
            className={`w-1/2 h-full bg-cover bg-left border-l border-amber-500/30 shadow-2xl transition-transform duration-700 ease-in-out ${theme.bg} ${
              isOpen ? "translate-x-full" : "translate-x-0"
            }`}
          />
        </div>
      )}
    </div>
  );
}