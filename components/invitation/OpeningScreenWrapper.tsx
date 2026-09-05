"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

interface OpeningScreenWrapperProps {
  themeId?: string | null;
  guestName: string;
  eventTitle: string;
  children: React.ReactNode;
}

const OPENING_THEMES: Record<
  string,
  { name: string; leftImg: string; rightImg: string; bg: string; sealText: string }
> = {
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

  const theme = OPENING_THEMES[themeId || "classic-gold"] || OPENING_THEMES["classic-gold"];

  const handleOpen = () => {
    setIsOpen(true);
    // On attend exactement la fin de l'animation (3000ms + 200ms de marge) avant d'enlever du DOM
    setTimeout(() => {
      setIsFullyHidden(true);
    }, 3200);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Contenu principal de l'invitation */}
      <div
        className={`transition-all duration-[3000ms] ease-[cubic-bezier(0.25,1,0.5,1)] transform ${
          isOpen ? "scale-100 opacity-100 blur-0" : "scale-95 opacity-80 blur-[2px]"
        }`}
      >
        {children}
      </div>

      {/* RIDEAU D'OUVERTURE (Double Portes / Enveloppe) */}
      {!isFullyHidden && (
        <div className="fixed inset-0 z-50 flex overflow-hidden pointer-events-auto">
          {/* Battant GAUCHE */}
          <div
            style={{ backgroundImage: `url(${theme.leftImg})` }}
            className={`w-[calc(50%+20px)] h-full z-10 bg-cover bg-right border-r border-amber-500/30 shadow-2xl transition-transform duration-[3000ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${theme.bg} ${
              isOpen ? "-translate-x-full" : "translate-x-0"
            }`}
          />

          {/* Sceau / Bouton Central */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4 text-center px-4 transition-all duration-500 ease-out ${
              isOpen ? "scale-50 opacity-0 pointer-events-none" : "scale-100 opacity-100"
            }`}
          >
            <div className="backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl max-w-sm w-full mx-auto bg-black/30">
              <button
                onClick={handleOpen}
                className="w-full py-3 px-6 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transform active:scale-95 transition"
              >
                <Sparkles size={18} />
                <span>{theme.sealText}</span>
              </button>
            </div>
          </div>

          {/* Battant DROIT */}
          <div
            style={{ backgroundImage: `url(${theme.rightImg})` }}
            className={`w-[calc(50%+20px)] -ml-10 h-full z-20 bg-cover bg-left border-l border-amber-500/30 shadow-2xl transition-transform duration-[3000ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${theme.bg} ${
              isOpen ? "translate-x-[calc(100%+40px)]" : "translate-x-0"
            }`}
          />
        </div>
      )}
    </div>
  );
}