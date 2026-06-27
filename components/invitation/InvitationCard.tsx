"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, MapPin, Clock, Download, Check, X, Heart, Gift, Trophy, Music, User, Users, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";

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
  invitationType?: string | null;
};

type EventType = "MARIAGE" | "ANNIVERSAIRE" | "SOUTENANCE" | "AUTRE";

const typeConfigs = {
  MARIAGE: { 
    icon: Heart, 
    bg: "bg-rose-50 dark:bg-rose-950/20", 
    border: "border-rose-200", 
    accent: "text-rose-600", 
    label: "Mariage",
    invitationTitle: "Invitation de mariage"
  },
  ANNIVERSAIRE: { 
    icon: Gift, 
    bg: "bg-pink-50 dark:bg-pink-950/20", 
    border: "border-pink-200", 
    accent: "text-pink-600", 
    label: "Anniversaire",
    invitationTitle: "Invitation d'anniversaire"
  },
  SOUTENANCE: { 
    icon: Trophy, 
    bg: "bg-purple-50 dark:bg-purple-950/20", 
    border: "border-purple-200", 
    accent: "text-purple-600", 
    label: "Soutenance",
    invitationTitle: "Invitation à la soutenance"
  },
  AUTRE: { 
    icon: Music, 
    bg: "bg-blue-50 dark:bg-blue-950/20", 
    border: "border-blue-200", 
    accent: "text-blue-600", 
    label: "Autre",
    invitationTitle: "Invitation"
  },
} as const;

export default function InvitationCard({
  event,
  guestName,
  guestTitle,
  guestId,
}: {
  event: Event;
  guestName: string;
  guestTitle?: string;
  guestId: string;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const fullName = guestTitle ? `${guestTitle} ${guestName}` : guestName;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
  const invitationLink = `${baseUrl}/invitation/${event.slug}?firstName=${encodeURIComponent(
    guestName.split(" ")[0]
  )}&lastName=${encodeURIComponent(guestName.split(" ").slice(1).join(" ") || "")}`;

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
  const config = typeConfigs[type] || typeConfigs["AUTRE"];
  const TypeIcon = config.icon;

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

  // ✅ Fonction corrigée pour le téléchargement
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
      // 1. Sauvegarder les styles qui pourraient contenir "lab"
      const element = cardRef.current;
      const styleBackups: { el: Element; prop: string; value: string }[] = [];
      const allElements = element.querySelectorAll("*");
      allElements.forEach((el) => {
        const style = (el as HTMLElement).style;
        // Vérifier les propriétés qui pourraient contenir "lab"
        const propsToCheck = ["color", "backgroundColor", "backgroundImage", "borderColor"];
        propsToCheck.forEach((prop) => {
          const val = style[prop as any];
          if (val && typeof val === "string" && val.includes("lab")) {
            styleBackups.push({ el, prop, value: val });
            // Remplacer par une valeur sûre
            if (prop === "color" || prop === "borderColor") {
              style[prop as any] = "#000000";
            } else if (prop === "backgroundColor") {
              style[prop as any] = "#ffffff";
            } else if (prop === "backgroundImage") {
              style[prop as any] = "none";
            }
          }
        });
      });

      // 2. Capturer
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // 3. Restaurer les styles
      styleBackups.forEach(({ el, prop, value }) => {
        (el as HTMLElement).style[prop as any] = value;
      });

      // 4. Télécharger
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
      const canvas = await html2canvas(qrRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
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

  // Déterminer le libellé pour 1 ou 2 personnes
  const peopleLabel = event.invitationType === "couple" ? "2 personnes" : "1 personne";
  const peopleIcon = event.invitationType === "couple" ? Users : User;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
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
              <TypeIcon size={64} className="mb-4" />
              <span className="text-4xl font-bold">{config.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div ref={cardRef} className="p-4 sm:p-6 md:p-8">
        {/* En-tête avec titre d'invitation et badge */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <TypeIcon size={20} className={config.accent} />
            <span className={`text-sm font-semibold ${config.accent}`}>{config.invitationTitle}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {peopleIcon === Users ? <Users size={14} /> : <User size={14} />}
            {peopleLabel}
          </span>
        </div>

        {/* Bonjour {nom} en plus petit */}
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-1">
          Bonjour <span className="font-semibold text-gray-900 dark:text-white">{fullName}</span>
        </p>

        {event.invitationNumber && (
          <div className="mt-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              <span className="text-primary-500 font-bold">#</span> {event.invitationNumber}
            </span>
            <span className="text-gray-400 hidden sm:inline">•</span>
            <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
              {event.invitationType === "couple" ? (
                <><Users size={14} className="text-purple-500" /> 2 personnes</>
              ) : (
                <><User size={14} className="text-blue-500" /> 1 personne</>
              )}
            </span>
          </div>
        )}

        {event.invitationText && (
          <div className="mt-4 p-4 bg-primary-50/50 dark:bg-primary-900/10 rounded-xl border-l-4 border-primary-500">
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
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Calendar size={18} className="text-primary-500 flex-shrink-0" />
            <span className="text-sm sm:text-base">{new Date(event.date).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Clock size={18} className="text-primary-500 flex-shrink-0" />
            <span className="text-sm sm:text-base">{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <MapPin size={18} className="text-primary-500 flex-shrink-0" />
            <span className="text-sm sm:text-base">{event.location}</span>
          </div>
        </div>

        {event.program && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Programme</h3>
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
            className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-xl transition disabled:opacity-50 text-sm sm:text-base"
          >
            <Download size={18} />
            {isDownloading ? "Téléchargement..." : "Télécharger l'invitation"}
          </button>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleAttendance("attending")}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition text-sm sm:text-base ${
                status === "attending"
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
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition text-sm sm:text-base ${
                status === "annule"
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