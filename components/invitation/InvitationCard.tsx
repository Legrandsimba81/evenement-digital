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
  MARIAGE: { icon: Heart, bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-200", accent: "text-red-600", label: "Mariage" },
  ANNIVERSAIRE: { icon: Gift, bg: "bg-pink-50 dark:bg-pink-950/20", border: "border-pink-200", accent: "text-pink-600", label: "Anniversaire" },
  SOUTENANCE: { icon: Trophy, bg: "bg-purple-50 dark:bg-purple-950/20", border: "border-purple-200", accent: "text-purple-600", label: "Soutenance" },
  AUTRE: { icon: Music, bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200", accent: "text-blue-600", label: "Autre" },
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
    const images = document.querySelectorAll("img");
    let loaded = 0;
    const total = images.length;
    if (total === 0) {
      setImagesLoaded(true);
      return;
    }
    const onLoad = () => {
      loaded++;
      if (loaded === total) setImagesLoaded(true);
    };
    images.forEach((img) => {
      if (img.complete) onLoad();
      else img.addEventListener("load", onLoad);
    });
    return () => {
      images.forEach((img) => img.removeEventListener("load", onLoad));
    };
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

  const downloadInvitation = async () => {
    if (!cardRef.current) return;
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          // Parcourir tous les éléments et remplacer les couleurs contenant 'lab' par du noir/blanc
          const allElements = clonedDoc.querySelectorAll("*");
          allElements.forEach((el) => {
            // Pour l'élément lui-même
            const style = (el as HTMLElement).style;
            let changed = false;
            // Vérifier les propriétés courantes
            const props = ["color", "backgroundColor", "borderColor", "background"];
            props.forEach((prop) => {
              const value = style[prop as any];
              if (value && typeof value === "string" && value.includes("lab")) {
                if (prop === "color") style.color = "#000000";
                else style.backgroundColor = "#ffffff";
                changed = true;
              }
            });
            // S'il y a un style inline, on le nettoie
            if (el.hasAttribute("style")) {
              const inlineStyle = el.getAttribute("style");
              if (inlineStyle && inlineStyle.includes("lab")) {
                // Remplacer les occurrences lab
                const newStyle = inlineStyle.replace(/lab\([^)]*\)/g, "#ffffff");
                el.setAttribute("style", newStyle);
              }
            }
            // Pour les classes, on ne peut pas facilement les modifier, mais on peut forcer un style inline
            // On ajoute un style inline pour les éléments avec des couleurs problématiques
            const computed = window.getComputedStyle(el);
            if (computed.color && computed.color.includes("lab")) {
              (el as HTMLElement).style.color = "#000000";
            }
            if (computed.backgroundColor && computed.backgroundColor.includes("lab")) {
              (el as HTMLElement).style.backgroundColor = "#ffffff";
            }
          });
        },
      });
      const link = document.createElement("a");
      link.download = `invitation-${event.slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Erreur de téléchargement", error);
      alert("Erreur lors du téléchargement. Réessayez.");
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

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Image héros en paysage */}
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
      <div ref={cardRef} className="p-6 md:p-8 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2 mb-2">
          <TypeIcon size={20} className={config.accent} />
          <span className={`text-sm font-semibold ${config.accent}`}>{config.label}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Bonjour <span className="text-primary-500">{fullName}</span>
        </h1>

        {event.invitationNumber && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="text-primary-500 font-bold">#</span> {event.invitationNumber}
            </span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
              {event.invitationType === "couple" ? (
                <><Users size={16} className="text-purple-500" /> 2 personnes</>
              ) : (
                <><User size={16} className="text-blue-500" /> 1 personne</>
              )}
            </span>
          </div>
        )}

        {event.invitationText && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-l-4 border-primary-500">
            <p className="text-gray-800 dark:text-gray-200 italic text-lg">
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
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Programme</h3>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {event.program}
            </div>
          </div>
        )}

        {/* QR Code */}
        <div className="mt-6 flex flex-col items-center">
          <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
            <QRCode value={invitationLink} size={150} />
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
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <button
            onClick={downloadInvitation}
            disabled={isDownloading || !imagesLoaded}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl transition disabled:opacity-50"
          >
            <Download size={20} />
            {isDownloading ? "Téléchargement..." : "Télécharger l'invitation"}
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => handleAttendance("attending")}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
                status === "attending"
                  ? "bg-green-500 text-white border-green-500"
                  : "border-gray-300 hover:bg-green-50 dark:border-gray-600 dark:hover:bg-green-900/20"
              }`}
            >
              <Check size={18} />
              {status === "attending" ? "Confirmé" : "Je serai présent(e)"}
            </button>
            <button
              onClick={() => handleAttendance("not_attending")}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
                status === "not_attending"
                  ? "bg-red-500 text-white border-red-500"
                  : "border-gray-300 hover:bg-red-50 dark:border-gray-600 dark:hover:bg-red-900/20"
              }`}
            >
              <X size={18} />
              {status === "not_attending" ? "Indisponible" : "Indisponible"}
            </button>
          </div>
        </div>
        {status && (
          <p className="text-center text-sm text-gray-500 mt-2">
            {status === "attending"
              ? "Merci ! Nous avons bien enregistré votre présence."
              : "Nous avons bien noté votre indisponibilité."}
          </p>
        )}
      </div>
    </div>
  );
}