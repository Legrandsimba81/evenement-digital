"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import GuestForm from "@/components/forms/GuestForm";
import GuestList from "@/components/guests/GuestList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Clock,
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
  History,
  ShieldCheck,
  ChevronRight,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showMobileHint, setShowMobileHint] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.octaviaevent.com";
  const invitationLink = `${baseUrl}/invitation/${event.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(invitationLink);
    alert("Lien copié dans le presse-papier !");
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

  // Navigation / Actions de la Sidebar
  const sidebarLinks = [
    {
      title: "Gestion principale",
      items: [
        {
          label: "Modifier l'événement",
          href: `/dashboard/${event.slug}/edit`,
          icon: <Edit size={18} />,
          color: "hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-600 dark:text-amber-400",
        },
        {
          label: `Voir ${isBillet ? "le Billet" : "l'Invitation"}`,
          href: `/invitation/${event.slug}`,
          target: "_blank",
          icon: <Eye size={18} />,
          color: "hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400",
        },
        {
          label: "Gérer le lieu",
          href: `/dashboard/event/${event.slug}/location`,
          icon: <MapPin size={18} />,
          color: "hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
        },
      ],
    },
    {
      title: "Contrôle & Accès",
      items: [
        {
          label: "Scanner & Contrôle d'accès",
          href: `/gate/${event.slug}`,
          icon: <ShieldCheck size={18} />,
          color: "hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-600 dark:text-purple-400",
        },
        {
          label: "Collaborateurs",
          href: `/dashboard/${event.slug}/collaborators`,
          icon: <Users size={18} />,
          color: "hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400",
        },
        ...(event.isPaid
          ? [
              {
                label: "QR Invités Hors Liste",
                href: `/dashboard/${event.slug}/unlisted-qr`,
                icon: <QrCode size={18} />,
                color: "hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30 text-fuchsia-600 dark:text-fuchsia-400",
              },
            ]
          : []),
      ],
    },
    {
      title: "Suivi & Aide",
      items: [
        {
          label: "Historique d'activité",
          href: `/dashboard/${event.slug}/logs`,
          icon: <History size={18} />,
          color: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
        },
        {
          label: "Guide du Tableau de bord",
          href: "/guide-dashboard",
          icon: <BookOpen size={18} />,
          color: "hover:bg-sky-50 dark:hover:bg-sky-950/30 text-sky-600 dark:text-sky-400",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      {/* Barre supérieure mobile pour le bouton Hamburger */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <Menu size={18} />
          <span>Menu Actions</span>
        </button>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {event.type}
        </span>
      </div>

      {/* Tuto / Banner Mobile */}
      {showMobileHint && (
        <div className="lg:hidden mx-4 mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 rounded-xl flex items-start justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p>
              <strong>Astuce :</strong> Touchez le bouton <span className="underline font-semibold">« Menu Actions »</span> en haut pour accéder aux paramètres, scanner, collaborateurs et historiques.
            </p>
          </div>
          <button onClick={() => setShowMobileHint(false)} className="text-blue-400 hover:text-blue-600 p-0.5">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-8">
        {/* Overlay d'arrière-plan pour fermer la sidebar sur mobile en cliquant à l'extérieur */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          />
        )}

        {/* Sidebar d'actions (Desktop Fixe / Mobile Tiroir) */}
        <aside
          className={`fixed lg:sticky top-0 lg:top-6 left-0 h-full lg:h-auto z-50 lg:z-auto w-72 bg-white dark:bg-gray-900 border-r lg:border border-gray-200 dark:border-gray-800 lg:rounded-2xl p-5 shadow-2xl lg:shadow-sm transform transition-transform duration-300 ease-in-out shrink-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 lg:hidden">
            <h2 className="font-bold text-gray-900 dark:text-white text-base">Actions d'événement</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6 mt-4 lg:mt-0">
            {sidebarLinks.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item, itemIdx) => (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      target={item.target}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${item.color}`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight size={14} className="opacity-40" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Contenu Principal */}
        <main className="flex-1 space-y-6">
          {/* Header de l'événement */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mb-2">
                  {event.type}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {event.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                  <MapPin size={15} className="text-gray-400" />
                  {event.location}
                </p>
              </div>

              <div className="flex items-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-gray-800">
                <div className="text-left sm:text-right">
                  <p className="text-xs text-gray-400">Date de l'événement</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(event.date).toLocaleDateString("fr-FR")} à {event.time}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Système d'onglets */}
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 rounded-2xl shadow-sm mb-6">
              <TabsTrigger value="invitation" className="flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 rounded-xl">
                <Eye size={16} /> <span className="hidden sm:inline">Aperçu</span>
              </TabsTrigger>
              <TabsTrigger value="guests" className="flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 rounded-xl">
                <Users size={16} /> <span className="hidden sm:inline">{isAutreBillet ? "Billets" : "Invités"}</span> ({event.guests.length})
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 rounded-xl">
                <MessageSquare size={16} /> <span className="hidden sm:inline">Messages</span> ({event.messages.length})
              </TabsTrigger>
            </TabsList>

            {/* Onglet Invitation */}
            <TabsContent value="invitation" className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                  <Share2 size={18} className="text-blue-500" />
                  Partager {label}
                </h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    readOnly
                    value={invitationLink}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-xs sm:text-sm font-mono"
                  />
                  <button
                    onClick={copyLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
                  >
                    <Link2 size={16} /> Copier le lien
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Aperçu {isAutreBillet ? "du billet" : "de l'invitation"}
                </h2>
                <div className="bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 max-w-md mx-auto shadow-inner">
                  {event.imageUrl && (
                    <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800 mb-4">
                      <img src={event.imageUrl} alt="Événement" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{event.title}</h3>
                    <div className="grid grid-cols-1 gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-blue-500" />
                        <span>{new Date(event.date).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-blue-500" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-blue-500" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    {event.invitationText && (
                      <p className="p-3 bg-white dark:bg-gray-900 rounded-xl italic text-xs text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
                        "{event.invitationText}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Onglet Invités */}
            <TabsContent value="guests" className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Gestion des invités</h2>
                <GuestForm eventId={event.id} />
                <div className="mt-6">
                  <GuestList guests={event.guests} eventId={event.id} eventSlug={event.slug} event={event} />
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-gray-500">Exporter la liste des invités :</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport("csv")}
                      disabled={isExporting}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-medium transition disabled:opacity-50"
                    >
                      <Download size={14} /> CSV
                    </button>
                    <button
                      onClick={() => handleExport("pdf")}
                      disabled={isExporting}
                      className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-medium transition disabled:opacity-50"
                    >
                      <Download size={14} /> PDF
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Onglet Messages */}
            <TabsContent value="messages" className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Livre d'or / Messages</h2>
                {event.messages.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">Aucun message d'invité pour le moment.</p>
                ) : (
                  <div className="space-y-4">
                    {event.messages.map((msg) => (
                      <MessageItem key={msg.id} message={msg} isOrganizer={true} eventId={event.id} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}