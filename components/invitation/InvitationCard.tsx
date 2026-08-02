"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, MapPin, Clock, Download, Check, X, Heart, Gift, Trophy, Music, User, Users, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { captureElement } from "@/lib/captureImage";
import { Theme, getThemeById } from "@/lib/themes";
import { useInView } from "react-intersection-observer";

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
  format?: string | null;
};

type EventType = "MARIAGE" | "ANNIVERSAIRE" | "SOUTENANCE" | "AUTRE";

const defaultTypeConfigs = {
  MARIAGE: {
    icon: Heart,
    label: "Mariage",
    invitationTitle: "Invitation de mariage",
    defaultColors: {
      hexPrimary: "#e11d48",
      hexSecondary: "#ec4899",
      hexBackground: "#fdf2f8",
      hexAccent: "#ef4444",
      hexText: "#111827",
    },
  },
  ANNIVERSAIRE: {
    icon: Gift,
    label: "Anniversaire",
    invitationTitle: "Invitation d'anniversaire",
    defaultColors: {
      hexPrimary: "#ec4899",
      hexSecondary: "#fbbf24",
      hexBackground: "#fdf2f8",
      hexAccent: "#3b82f6",
      hexText: "#111827",
    },
  },
  SOUTENANCE: {
    icon: Trophy,
    label: "Soutenance",
    invitationTitle: "Invitation à la Defense",
    defaultColors: {
      hexPrimary: "#1d4ed8",
      hexSecondary: "#3b82f6",
      hexBackground: "#eff6ff",
      hexAccent: "#4b5563",
      hexText: "#111827",
    },
  },
  AUTRE: {
    icon: Music,
    label: "Autre",
    invitationTitle: "Invitation",
    defaultColors: {
      hexPrimary: "#f97316",
      hexSecondary: "#fbbf24",
      hexBackground: "#fff7ed",
      hexAccent: "#ef4444",
      hexText: "#111827",
    },
  },
} as const;

export default function InvitationCard({
  event,
  guestName,
  guestTitle,
  guestId,
  guestInvitationType,
  guestLevel,
}: {
  event: Event;
  guestName: string;
  guestTitle?: string;
  guestId: string;
  guestInvitationType?: string | null;
  guestLevel?: string | null;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Animations
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [titleRef, titleInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [textRef, textInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [detailsRef, detailsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [programRef, programInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [qrRefObserver, qrInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const peopleLabel = guestInvitationType === "couple" ? "2 personnes" : "1 personne";
  const peopleIcon = guestInvitationType === "couple" ? Users : User;

  const fullName = guestTitle ? `${guestTitle} ${guestName}` : guestName;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
  const levelParam = `&level=${encodeURIComponent(guestLevel || "STANDARD")}`;
  const invitationLink = `${baseUrl}/invitation/${event.slug}?firstName=${encodeURIComponent(
    guestName.split(" ")[0]
  )}&lastName=${encodeURIComponent(guestName.split(" ").slice(1).join(" ") || "")}${levelParam}`;

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

  const type = (event.type as EventType) || "AUTRE";
  const config = defaultTypeConfigs[type] || defaultTypeConfigs["AUTRE"];
  const Icon = config.icon;

  const defaultColors = defaultTypeConfigs[type]?.defaultColors || defaultTypeConfigs["AUTRE"].defaultColors;
  const colors = {
    hexPrimary: theme?.colors?.hexPrimary || defaultColors.hexPrimary,
    hexSecondary: theme?.colors?.hexSecondary || defaultColors.hexSecondary,
    hexBackground: theme?.colors?.hexBackground || defaultColors.hexBackground,
    hexAccent: theme?.colors?.hexAccent || defaultColors.hexAccent,
    hexText: theme?.colors?.hexText || defaultColors.hexText,
  };

  const isBillet = event.format === "BILLET";

  // Gestion du statut
  useEffect(() => {
    const savedStatus = localStorage.getItem(`status_${guestId}`);
    if (savedStatus) {
      setStatus(savedStatus);
    }
  }, [guestId]);

  // Vérification du chargement des images
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

  // Marquer le QR comme prêt après rendu
  useEffect(() => {
    const timer = setTimeout(() => setQrReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
      const canvas = await captureElement(cardRef.current, { backgroundColor: '#ffffff' });
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
    if (!qrRef.current) {
      alert("QR non disponible.");
      return;
    }
    if (!qrReady) {
      alert("Veuillez attendre le chargement du QR.");
      return;
    }
    setIsDownloadingQR(true);
    try {
      const canvas = await captureElement(qrRef.current, { backgroundColor: '#ffffff' });
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

  const fadeInUp = "transition-all duration-700 ease-out transform";
  const fadeInUpHidden = "opacity-0 translate-y-6";
  const fadeInUpVisible = "opacity-100 translate-y-0";

  return (
    <div className="rounded-2xl shadow-xl overflow-hidden bg-white">
      {/* Image héros (non capturée) */}
      <div
        ref={heroRef}
        className={`relative w-full aspect-video overflow-hidden bg-gray-100 ${fadeInUp} ${
          heroInView ? fadeInUpVisible : fadeInUpHidden
        }`}
      >
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

      {/* Contenu à capturer (fond blanc forcé) */}
      <div ref={cardRef} className="bg-white p-4 sm:p-6 md:p-8 space-y-6" style={{ backgroundColor: '#ffffff' }}>
        {/* Titre + sous-titre (icône + nb personnes) */}
        <div ref={titleRef} className={`space-y-2 ${fadeInUp} ${titleInView ? fadeInUpVisible : fadeInUpHidden}`}>
          {isBillet ? (
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Billet de {event.title}
            </h1>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: colors.hexPrimary }}>
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Icon size={18} style={{ color: colors.hexPrimary }} />
                  {invitationTitle}
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                  {peopleIcon === Users ? <Users size={14} /> : <User size={14} />}
                  {peopleLabel}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Salutation + niveau + numéro */}
        <div ref={textRef} className={`${fadeInUp} ${textInView ? fadeInUpVisible : fadeInUpHidden}`}>
          <p className="text-base sm:text-lg text-gray-600">
            Bonjour <span className="font-semibold text-gray-900">{fullName}</span>
            {guestLevel && (
              <span className="ml-2 inline-block text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700 font-medium">
                {guestLevel}
              </span>
            )}
          </p>

          {event.invitationNumber && (
            <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: '#f9fafb' }}>
              <span className="font-medium text-gray-800">
                <span style={{ color: colors.hexPrimary }} className="font-bold">#</span> {event.invitationNumber}
              </span>
            </div>
          )}

          {event.type === "SOUTENANCE" && event.thesisTitle && (
            <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#f3e8ff' }}>
              <p className="text-sm text-gray-800">
                <span className="font-semibold">Sujet de thèse :</span> {event.thesisTitle}
              </p>
            </div>
          )}
        </div>

        {/* Texte d'invitation */}
        {event.invitationText && (
          <div
            ref={textRef}
            className={`p-5 rounded-xl ${fadeInUp} ${textInView ? fadeInUpVisible : fadeInUpHidden}`}
            style={{ backgroundColor: colors.hexBackground || '#f8fafc' }}
          >
            <p className="text-gray-800 italic text-base sm:text-lg leading-relaxed">
              {event.invitationText}
            </p>
          </div>
        )}

        {/* Image d'invitation (deuxième photo) */}
        {event.invitationImageUrl && (
          <div ref={textRef} className={`rounded-xl overflow-hidden shadow-sm ${fadeInUp} ${textInView ? fadeInUpVisible : fadeInUpHidden}`}>
            <img
              src={event.invitationImageUrl}
              alt="Invitation"
              className="w-full h-auto aspect-video object-cover"
            />
          </div>
        )}

        {/* Détails (date, heure, lieu) */}
        <div
          ref={detailsRef}
          className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${fadeInUp} ${
            detailsInView ? fadeInUpVisible : fadeInUpHidden
          }`}
        >
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#f9fafb' }}>
            <Calendar size={20} style={{ color: colors.hexPrimary }} className="flex-shrink-0" />
            <span className="text-sm text-gray-800">
              {new Date(event.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#f9fafb' }}>
            <Clock size={20} style={{ color: colors.hexPrimary }} className="flex-shrink-0" />
            <span className="text-sm text-gray-800">{event.time}</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#f9fafb' }}>
            <MapPin size={20} style={{ color: colors.hexPrimary }} className="flex-shrink-0" />
            <span className="text-sm text-gray-800">{event.location}</span>
          </div>
        </div>

        {/* Programme */}
        {event.program && (
          <div
            ref={programRef}
            className={`p-5 rounded-xl ${fadeInUp} ${programInView ? fadeInUpVisible : fadeInUpHidden}`}
            style={{ backgroundColor: colors.hexBackground || '#f8fafc' }}
          >
            <h3
              className="font-semibold mb-3 inline-block px-3 py-1 rounded-lg text-white"
              style={{ backgroundColor: colors.hexPrimary }}
            >
              Programme de la journée
            </h3>
            <div className="text-gray-800 whitespace-pre-line text-sm sm:text-base">
              {event.program}
            </div>
          </div>
        )}

        {/* QR Code - pleine largeur avec fond distinct */}
        <div
          ref={qrRefObserver}
          className={`w-full -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-6 ${fadeInUp} ${
            qrInView ? fadeInUpVisible : fadeInUpHidden
          }`}
          style={{ background: `linear-gradient(to right, ${colors.hexPrimary}15, ${colors.hexSecondary}25)` }}
        >
          <div
            ref={qrRef}
            className="flex flex-col items-center bg-white rounded-2xl p-6 shadow-lg max-w-xs mx-auto"
            style={{ backgroundColor: '#ffffff' }}
          >
            <QRCode value={invitationLink} size={180} />
            <p className="text-center text-sm text-gray-600 mt-3 font-medium">
              Scannez pour accéder à l'invitation
            </p>
          </div>
        </div>
      </div>

      {/* Boutons d'action (en dehors de la capture) */}
      <div className="p-4 sm:p-6 md:p-8 pt-0 space-y-4 bg-white rounded-b-2xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={downloadInvitation}
            disabled={isDownloading || !imagesLoaded}
            className="flex-1 flex items-center justify-center gap-2 text-white px-4 py-3 rounded-xl transition disabled:opacity-50 text-sm sm:text-base"
            style={{ backgroundColor: colors.hexPrimary }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hexSecondary}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.hexPrimary}
          >
            <Download size={18} />
            {isDownloading ? "Téléchargement..." : "Télécharger l'invitation"}
          </button>
          <button
            onClick={downloadQR}
            disabled={isDownloadingQR || !qrReady}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-xl transition disabled:opacity-50 text-sm sm:text-base"
          >
            <QrCode size={18} />
            {isDownloadingQR ? "Téléchargement..." : "Télécharger le QR"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => handleAttendance("attending")}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border-2 transition text-sm sm:text-base font-medium ${
              status === "attending"
                ? "bg-green-500 text-white border-green-500"
                : "bg-white text-gray-800 border-gray-300 hover:border-green-500 hover:bg-green-50"
            }`}
          >
            <Check size={18} />
            {status === "attending" ? "Présence confirmée" : "Je serai présent(e)"}
          </button>
          <button
            onClick={() => handleAttendance("annule")}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border-2 transition text-sm sm:text-base font-medium ${
              status === "annule"
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-gray-800 border-gray-300 hover:border-red-500 hover:bg-red-50"
            }`}
          >
            <X size={18} />
            {status === "annule" ? "Indisponible" : "Indisponible"}
          </button>
        </div>

        {status && (
          <p className="text-center text-sm text-gray-500">
            {status === "attending"
              ? "✅ Présence confirmée – Merci !"
              : status === "annule"
                ? "❌ Indisponible – Nous avons bien noté votre réponse."
                : "⏳ En attente de confirmation."}
          </p>
        )}
      </div>
    </div>
  );
}