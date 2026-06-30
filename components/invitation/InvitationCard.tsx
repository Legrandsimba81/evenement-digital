"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, MapPin, Clock, Download, Check, X, Heart, Gift, Trophy, Music, User, Users, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { captureElement } from "@/lib/captureImage";
import { Theme, getThemeById } from "@/lib/themes";

type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  status?: string | null;
};

type Event = {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string | null;
  invitationImageUrl: string | null;
  invitationText: string | null;
  program: string | null;
  slug: string;
  invitationNumber?: string | null;
  theme?: string | null;
  thesisTitle?: string | null;
};

type EventType = "MARIAGE" | "ANNIVERSAIRE" | "SOUTENANCE" | "AUTRE";

const defaultTypeConfigs = {
  MARIAGE: {
    icon: Heart,
    bg: "bg-rose-50 dark:bg-rose-950/20",
    border: "border-rose-200",
    accent: "text-rose-600",
    label: "Mariage",
    invitationTitle: "Invitation de mariage",
  },
  ANNIVERSAIRE: {
    icon: Gift,
    bg: "bg-pink-50 dark:bg-pink-950/20",
    border: "border-pink-200",
    accent: "text-pink-600",
    label: "Anniversaire",
    invitationTitle: "Invitation d'anniversaire",
  },
  SOUTENANCE: {
    icon: Trophy,
    bg: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-200",
    accent: "text-purple-600",
    label: "Soutenance",
    invitationTitle: "Invitation à la soutenance",
  },
  AUTRE: {
    icon: Music,
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200",
    accent: "text-blue-600",
    label: "Autre",
    invitationTitle: "Invitation",
  },
} as const;

export default function InvitationCard({
  event,
  guestName,
  guestTitle,
  guestId,
  guestInvitationType,
}: {
  event: Event;
  guestName: string;
  guestTitle?: string;
  guestId: string;
  guestInvitationType?: string | null;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // ✅ Le badge affiche le nombre de personnes défini par l'organisateur pour cet invité
  const peopleLabel = guestInvitationType === "couple" ? "2 personnes" : "1 personne";
  const peopleIcon = guestInvitationType === "couple" ? Users : User;

  const fullName = guestTitle ? `${guestTitle} ${guestName}` : guestName;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
  const invitationLink = `${baseUrl}/invitation/${event.slug}?firstName=${encodeURIComponent(
    guestName.split(" ")[0]
  )}&lastName=${encodeURIComponent(guestName.split(" ").slice(1).join(" ") || "")}`;

  // ✅ Récupérer le thème
  let theme: Theme | null = null;
  try {
    if (event.theme) {
      theme = JSON.parse(event.theme);
    }
  } catch (e) {
    console.warn("Erreur de parsing du thème", e);
  }

  if (!theme) {
    const defaultThemeId = event.type === "MARIAGE" ? "wedding-romantic" :
      event.type === "ANNIVERSAIRE" ? "birthday-colorful" :
        event.type === "SOUTENANCE" ? "defense-academic" : "other-festive";
    const defaultTheme = getThemeById(defaultThemeId);
    if (defaultTheme) theme = defaultTheme;
  }

  if (!theme) {
    theme = {
      id: "fallback",
      name: "Standard",
      description: "",
      category: "AUTRE",
      colors: {
        primary: "blue-600",
        secondary: "blue-400",
        background: "white",
        accent: "blue-800",
        text: "gray-900",
        hexPrimary: "#2563eb",
        hexSecondary: "#60a5fa",
        hexBackground: "#ffffff",
        hexAccent: "#1e40af",
        hexText: "#111827",
      },
      icons: { main: Music },
      animation: "none",
      backgroundStyle: "solid",
      className: "bg-white",
    };
  }

  const Icon = theme?.icons?.main || defaultTypeConfigs[event.type as EventType]?.icon || Music;
  const colors = theme.colors;

  useEffect(() => {
    const savedStatus = localStorage.getItem(`status_${guestId}`);
    if (savedStatus) {
      setStatus(savedStatus);
    }
  }, [guestId]);

  useEffect(() => {
    const checkImages = () => {
      const images = document.querySelectorAll("img");
      if (images.length === 0) {
        setImagesLoaded(true);
        return;
      }
      let loaded = 0;
      images.forEach((img) => {
        if (img.complete) loaded++;
        else img.addEventListener("load", () => {
          loaded++;
          if (loaded === images.length) setImagesLoaded(true);
        });
      });
      if (loaded === images.length) setImagesLoaded(true);
    };
    checkImages();
  }, [event.imageUrl, event.invitationImageUrl]);

  const type = (event.type as EventType) || "AUTRE";
  const config = defaultTypeConfigs[type] || defaultTypeConfigs["AUTRE"];

  const handleAttendance = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/guest/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          guestName: guestName,
          status: newStatus,
        }),
      });
      if (res.ok) {
        setStatus(newStatus);
        localStorage.setItem(`status_${guestId}`, newStatus);
      } else {
        alert("Erreur lors de la mise à jour de votre statut.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur réseau.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvitation = async () => {
    if (!cardRef.current) {
      alert("Référence de la carte non trouvée.");
      return;
    }
    if (!imagesLoaded) {
      alert("Veuillez attendre le chargement des images.");
      return;
    }
    setIsDownloading(true);
    try {
      const canvas = await captureElement(cardRef.current);
      const link = document.createElement("a");
      link.download = `invitation-${event.slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Erreur de téléchargement:", error);
      alert("Erreur lors du téléchargement. Veuillez réessayer.");
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadQR = async () => {
    if (!qrRef.current) return;
    setIsDownloadingQR(true);
    try {
      const canvas = await captureElement(qrRef.current);
      const link = document.createElement("a");
      link.download = `qr-${event.slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Erreur de téléchargement du QR", error);
      alert("Erreur lors du téléchargement du QR.");
    } finally {
      setIsDownloadingQR(false);
    }
  };

  const invitationTitle = theme?.invitationTitle || config.invitationTitle;

  return (
    <div
      className={`rounded-2xl shadow-xl overflow-hidden border ${theme.className || 'bg-white dark:bg-gray-900'}`}
      style={{ borderColor: colors.hexPrimary || '#2563eb' }}
    >
      {/* Image héros */}
      <div className="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt="Photo de l'événement"
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <div className="flex flex-col items-center text-white">
              <Icon size={64} className="mb-4" />
              <span className="text-4xl font-bold">{config.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div ref={cardRef} className="p-4 sm:p-6 md:p-8">
        {/* ✅ En-tête : titre d'invitation + badge personnes (issu de guestInvitationType) */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Icon size={20} style={{ color: colors.hexPrimary }} />
            <span className="text-sm font-semibold" style={{ color: colors.hexPrimary }}>
              {invitationTitle}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {peopleIcon === Users ? <Users size={14} /> : <User size={14} />}
            {peopleLabel}
          </span>
        </div>

        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-1">
          Bonjour <span className="font-semibold text-gray-900 dark:text-white">{fullName}</span>
        </p>

        {event.invitationNumber && (
          <div className="mt-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              <span style={{ color: colors.hexPrimary }} className="font-bold">#</span> {event.invitationNumber}
            </span>
            {/* Plus de répétition du type d'invitation ici */}
          </div>
        )}

        {/* Sujet de thèse pour les soutenances */}
        {event.type === "SOUTENANCE" && event.thesisTitle && (
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border-l-4 border-purple-500">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Sujet de thèse :</span> {event.thesisTitle}
            </p>
          </div>
        )}

        {event.invitationText && (
          <div
            className="mt-4 p-4 rounded-xl border-l-4"
            style={{ borderLeftColor: colors.hexPrimary, backgroundColor: colors.hexBackground || '#f8fafc' }}
          >
            <p className="text-gray-800 dark:text-gray-200 italic text-base sm:text-lg">
              {event.invitationText}
            </p>
          </div>
        )}

        {event.invitationImageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden">
            <img
              src={event.invitationImageUrl}
              alt="Invitation"
              className="w-full h-auto aspect-video object-cover"
            />
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} style={{ color: colors.hexPrimary }} className="flex-shrink-0" />
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              {new Date(event.date).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={18} style={{ color: colors.hexPrimary }} className="flex-shrink-0" />
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={18} style={{ color: colors.hexPrimary }} className="flex-shrink-0" />
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{event.location}</span>
          </div>
        </div>

        {event.program && (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <h3 className="font-semibold mb-2" style={{ color: colors.hexPrimary }}>
              Programme
            </h3>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm sm:text-base">
              {event.program}
            </div>
          </div>
        )}

        {/* QR Code */}
        <div className="mt-6 flex flex-col items-center">
          <div ref={qrRef} className="bg-white p-3 sm:p-4 rounded-xl shadow-md flex flex-col items-center">
            <QRCode value={invitationLink} size={120} />
            <p className="text-center text-xs text-gray-500 mt-2">
              Scannez pour accéder à l'invitation
            </p>
          </div>
          <button
            onClick={downloadQR}
            disabled={isDownloadingQR}
            className="mt-3 flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl transition disabled:opacity-50 text-sm"
          >
            <QrCode size={16} />
            {isDownloadingQR ? "Téléchargement..." : "Télécharger le QR"}
          </button>
        </div>

        {/* Boutons d'action */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <button
            onClick={downloadInvitation}
            disabled={isDownloading || !imagesLoaded}
            className="flex items-center justify-center gap-2 text-white px-4 py-3 rounded-xl transition disabled:opacity-50 text-sm sm:text-base"
            style={{ backgroundColor: colors.hexPrimary }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hexSecondary}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.hexPrimary}
          >
            <Download size={18} />
            {isDownloading ? "Téléchargement..." : "Télécharger l'invitation"}
          </button>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleAttendance("attending")}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition text-sm sm:text-base ${status === "attending"
                  ? "bg-green-500 text-white border-green-500"
                  : "border-gray-300 hover:bg-green-50 dark:border-gray-600 dark:hover:bg-green-900/20"
                }`}
            >
              <Check size={18} />
              {status === "attending" ? "Confirmé" : "Je serai présent(e)"}
            </button>
            <button
              onClick={() => handleAttendance("annule")}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition text-sm sm:text-base ${status === "annule"
                  ? "bg-red-500 text-white border-red-500"
                  : "border-gray-300 hover:bg-red-50 dark:border-gray-600 dark:hover:bg-red-900/20"
                }`}
            >
              <X size={18} />
              {status === "annule" ? "Indisponible" : "Indisponible"}
            </button>
          </div>
        </div>
        {status && (
          <p className="text-center text-sm text-gray-500 mt-3">
            {status === "attending"
              ? "Présence confirmée – Merci !"
              : status === "annule"
                ? "Indisponible – Nous avons bien noté votre réponse."
                : "En attente de confirmation."}
          </p>
        )}
      </div>
    </div>
  );
}