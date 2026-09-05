"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import GuestForm from "@/components/forms/GuestForm";
import GuestList from "@/components/guests/GuestList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Users,
  MessageSquare,
  Link2,
  Edit,
  Eye,
  Download,
  BookOpen,
  Share2,
  QrCode,
  Menu,
  X,
  Info,
  ChevronRight,
  History,
} from "lucide-react";
import MessageItem from "@/components/invitation/MessageItem";

type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  eventId: string;
};

type Message = {
  id: string;
  content: string;
  guestName: string;
  eventId: string;
  createdAt: string;
  guestId?: string | null;
};

type Event = {
  id: string;
  title: string;
  type: string;
  description: string | null;
  invitationText: string | null;
  program: string | null;
  location: string;
  date: string;
  time: string;
  imageUrl: string | null;
  invitationImageUrl: string | null;
  slug: string;
  guests: Guest[];
  messages: Message[];
  userId: string;
  theme?: string | null;
  format?: string | null;
  isPaid: boolean;
  unlistedGuestsLimit?: number | null;
  unlistedGuestsCount?: number;
  unlistedQrToken?: string | null;
};

export default function EventDetailsClient({ event }: { event: Event }) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"invitation" | "guests" | "messages">("invitation");
  const [isExporting, setIsExporting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileTuto, setShowMobileTuto] = useState(true);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const burgerButtonRef = useRef<HTMLButtonElement>(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.octaviaevent.com";
  const invitationLink = `${baseUrl}/invitation/${event.slug}`;

  // Fermeture du menu mobile lors d'un clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        mobileMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node) &&
        burgerButtonRef.current &&
        !burgerButtonRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  const copyLink = () => {
    navigator.clipboard.writeText(invitationLink);
  };

  const handleExport = async (format: "csv" | "pdf") => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/export-guests?eventId=${event.id}&format=${format}`);
      if (!res.ok) throw new Error("Erreur lors de l'export");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invites-${event.slug}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors du téléchargement.");
    } finally {
      setIsExporting(false);
    }
  };

  const isAutreBillet = event.type === "AUTRE" && event.format === "BILLET";
  const label = isAutreBillet ? "billet" : "invitation";
  const isBillet = event.format === "BILLET";

  const menuLinks = [
    {
      href: `/dashboard/${event.slug}/edit`,
      label: "Modifier l'événement",
      icon: <Edit size={16} />,
      color: "hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
    },
    {
      href: `/invitation/${event.slug}`,
      label: isBillet ? "Aperçu du billet" : "Aperçu de l'invitation",
      icon: <Eye size={16} />,
      target: "_blank",
      color: "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    },
    {
      href: `/gate/${event.slug}`,
      label: "Contrôle d'accès",
      icon: <Users size={16} />,
      color: "hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    },
    {
      href: `/dashboard/${event.slug}/collaborators`,
      label: "Collaborateurs",
      icon: <Users size={16} />,
      color: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    },
    ...(event.isPaid
      ? [
          {
            href: `/dashboard/${event.slug}/unlisted-qr`,
            label: "QR invités hors liste",
            icon: <QrCode size={16} />,
            color: "hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400",
          },
        ]
      : []),
    {
      href: `/dashboard/event/${event.slug}/location`,
      label: "Gérer le lieu",
      icon: <MapPin size={16} />,
      color: "hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-600 dark:text-teal-400",
    },
    {
    href: `/dashboard/${event.slug}/opening-screen`,
    label: "Écran d'ouverture",
    icon: <Sparkles size={16} />,
    color: "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  },
    {
      href: `/dashboard/${event.slug}/logs`,
      label: "Historique",
      icon: <History size={16} />,
      color: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400",
    },
    {
      href: "/guide-dashboard",
      label: "Guide du tableau de bord",
      icon: <BookOpen size={16} />,
      color: "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    },
  ];

  const ActionMenuContent = () => (
    <div className="space-y-1 p-2">
      <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Menu d'actions
      </p>
      {menuLinks.map((link, idx) => (
        <Link
          key={idx}
          href={link.href}
          target={link.target || "_self"}
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${link.color}`}
        >
          {link.icon}
          <span className="flex-1">{link.label}</span>
          <ChevronRight size={14} className="opacity-40" />
        </Link>
      ))}
    </div>
  );

  const InvitationPreview = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden max-w-lg mx-auto">
      {event.imageUrl && (
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={event.imageUrl}
            alt="Événement"
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{event.type}</p>
        <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-500" />
            <span>{event.location}</span>
          </div>
        </div>
        {event.invitationText && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl italic text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
            {event.invitationText}
          </div>
        )}
        {event.program && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Programme</h4>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl whitespace-pre-line text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
              {event.program}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen">
      {/* Overlay mobile flouté */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" />
      )}

      {/* Sidebar - Desktop (Fixe/Normal) & Mobile (Drawer Coulissant) */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:z-auto ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between lg:hidden">
          <span className="font-bold text-gray-900 dark:text-white text-base">Actions de gestion</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-2 lg:pt-4">
          <ActionMenuContent />
        </div>
      </aside>

      {/* Zone de contenu principale */}
      <main className="flex-1 max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* En-tête avec bouton Burger pour Mobile */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {event.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {event.type} — {event.location}
            </p>
          </div>

          <button
            ref={burgerButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Ouvrir le menu d'actions"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Bannière d'astuce mobile pour localiser le burger */}
        {showMobileTuto && (
          <div className="lg:hidden bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 flex items-start gap-3 text-blue-900 dark:text-blue-200 text-sm shadow-sm relative">
            <Info size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 pr-6">
              <p className="font-semibold text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300">Astuce</p>
              <p className="text-xs sm:text-sm mt-0.5">
                Toutes les actions d'édition, de gestion du lieu et de contrôle d'accès sont regroupées dans le menu burger <Menu size={14} className="inline mx-0.5" /> en haut à droite.
              </p>
            </div>
            <button
              onClick={() => setShowMobileTuto(false)}
              className="absolute top-3 right-3 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 transition"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Onglets de contenu */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto lg:mx-0 mb-6">
            <TabsTrigger value="invitation" className="flex items-center gap-2 text-sm">
              <Eye size={16} /> Aperçu
            </TabsTrigger>
            <TabsTrigger value="guests" className="flex items-center gap-2 text-sm">
              <Users size={16} /> {isAutreBillet ? "Billets" : "Invités"}
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2 text-sm">
              <MessageSquare size={16} /> Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invitation" className="space-y-8">
            {/* Partager */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Share2 size={20} className="text-blue-500" />
                Partager {label}
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  readOnly
                  value={invitationLink}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={copyLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Link2 size={18} /> Copier
                </button>
              </div>
            </div>

            {/* Aperçu */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Aperçu {isAutreBillet ? "du billet" : "de l'invitation"}
              </h2>
              <InvitationPreview />
            </div>
          </TabsContent>

          <TabsContent value="guests" className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Gestion des invités
              </h2>
              <GuestForm eventId={event.id} />
              <div className="mt-6">
                <GuestList
                  guests={event.guests}
                  eventId={event.id}
                  eventSlug={event.slug}
                  event={event}
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => handleExport("csv")}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm transition disabled:opacity-50 font-medium"
                >
                  <Download size={18} />
                  {isExporting ? "Téléchargement..." : "CSV"}
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm transition disabled:opacity-50 font-medium"
                >
                  <Download size={18} />
                  {isExporting ? "Téléchargement..." : "PDF"}
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Messages des invités
              </h2>
              {event.messages.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Aucun message pour le moment.
                </p>
              ) : (
                <div className="space-y-4">
                  {event.messages.map((msg) => (
                    <MessageItem
                      key={msg.id}
                      message={msg}
                      isOrganizer={true}
                      eventId={event.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}