"use client";

import { useState } from "react";
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
} from "lucide-react";
import MessageItem from "@/components/invitation/MessageItem";
import { SiWhatsapp } from "react-icons/si";

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
};

export default function EventDetailsClient({ event }: { event: Event }) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"invitation" | "guests" | "messages">("invitation");
  const [isExporting, setIsExporting] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const invitationLink = `${baseUrl}/invitation/${event.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(invitationLink);
  };

  const shareWhatsApp = () => {
    const message = `Voici votre invitation: ${invitationLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
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
            <Calendar size={16} className="text-primary-500" />
            <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary-500" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-primary-500" />
            <span>{event.location}</span>
          </div>
        </div>
        {event.invitationText && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl italic text-gray-700 dark:text-gray-300">
            {event.invitationText}
          </div>
        )}
        {event.program && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Programme</h4>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
              {event.program}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* En-tête avec titre et actions */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {event.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {event.type} — {event.location}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/${event.slug}/edit`}
            className="inline-flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-full text-xs font-medium transition"
          >
            <Edit size={14} /> Modifier
          </Link>
          <Link
            href={`/invitation/${event.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-full text-xs font-medium transition"
          >
            <Eye size={14} /> {isBillet ? "Billet" : "Invitation"}
          </Link>
          <Link
            href={`/gate/${event.slug}`}
            className="inline-flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-medium transition"
          >
            <Users size={14} /> Contrôle
          </Link>
          <Link
            href={`/dashboard/${event.slug}/collaborators`}
            className="inline-flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-medium transition"
          >
            <Users size={14} /> Collab.
          </Link>
          <Link
            href={`/dashboard/${event.slug}/logs`}
            className="inline-flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-full text-xs font-medium transition"
          >
            <Clock size={14} /> Historique
          </Link>
          <Link
            href="/guide-utilisation"
            className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-full text-xs font-medium transition"
          >
            <BookOpen size={14} /> Guide
          </Link>
        </div>
      </div>

      {/* Onglets */}
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
              <Share2 size={20} className="text-primary-500" />
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
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
              >
                <Link2 size={18} /> Copier
              </button>
              <button
                onClick={shareWhatsApp}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
              >
                <SiWhatsapp size={20} /> WhatsApp
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
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm transition disabled:opacity-50"
              >
                <Download size={18} />
                {isExporting ? "Téléchargement..." : "CSV"}
              </button>
              <button
                onClick={() => handleExport("pdf")}
                disabled={isExporting}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm transition disabled:opacity-50"
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
    </div>
  );
}