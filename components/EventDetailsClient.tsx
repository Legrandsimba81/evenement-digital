"use client";

import { useState } from "react";
import Link from "next/link";
import GuestForm from "@/components/forms/GuestForm";
import GuestList from "@/components/guests/GuestList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Clock, Users, MessageSquare, Link2, Edit, Eye } from "lucide-react";

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
};

export default function EventDetailsClient({ event }: { event: Event }) {
  const [activeTab, setActiveTab] = useState("invitation");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  // ✅ Lien générique (sans paramètres)
  const invitationLink = `${baseUrl}/invitation/${event.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(invitationLink);
  };

  const shareWhatsApp = () => {
    const message = `Voici votre invitation: ${invitationLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  const InvitationPreview = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-6 max-w-2xl mx-auto">
      {/* ✅ Hero image en portrait */}
      {event.imageUrl && (
        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl">
          <img
            src={event.imageUrl}
            alt="Événement"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
        {event.title}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {event.type}
      </p>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Calendar size={18} />
          <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Clock size={18} />
          <span>{event.time}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <MapPin size={18} />
          <span>{event.location}</span>
        </div>
      </div>
      {event.invitationText && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-gray-800 dark:text-gray-200 italic">
            {event.invitationText}
          </p>
        </div>
      )}
      {event.program && (
        <div className="mt-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Programme</h3>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl whitespace-pre-line text-gray-700 dark:text-gray-300">
            {event.program}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {event.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {event.type} - {event.location}
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link
            href={`/dashboard/${event.slug}/edit`}
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl transition"
          >
            <Edit size={18} />
            Modifier
          </Link>
          <Link
            href={`/invitation/${event.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl transition"
          >
            <Eye size={18} />
            Voir l'invitation
          </Link>
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-8">
          <TabsTrigger value="invitation" className="flex items-center gap-2">
            <Eye size={16} /> Aperçu
          </TabsTrigger>
          <TabsTrigger value="guests" className="flex items-center gap-2">
            <Users size={16} /> Invités
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare size={16} /> Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invitation" className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Partager l'invitation</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                readOnly
                value={invitationLink}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <button
                onClick={copyLink}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Link2 size={18} /> Copier
              </button>
              <button
                onClick={shareWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                Partager sur WhatsApp
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Aperçu de l'invitation</h2>
            <InvitationPreview />
          </div>
        </TabsContent>

        <TabsContent value="guests" className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Gestion des invités</h2>
            <GuestForm eventId={event.id} />
            <div className="mt-6">
              {/* ✅ Passer eventSlug pour les liens personnels */}
              <GuestList guests={event.guests} eventId={event.id} eventSlug={event.slug} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Messages des invités</h2>
            {event.messages.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Aucun message pour le moment.
              </p>
            ) : (
              <div className="space-y-4">
                {event.messages.map((msg) => (
                  <div key={msg.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {msg.guestName}
                      </p>
                      <span className="text-sm text-gray-500">
                        {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}