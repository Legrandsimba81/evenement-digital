"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeGuest, updateGuestStatus } from "@/actions/guest-actions";
import EditGuestButton from "@/components/guests/EditGuestButton";
import GateQRButton from "@/components/guests/GateQRButton";
import { Search, Copy, Users, User, CheckCircle } from "lucide-react";

type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  status?: string | null;
  invitationNumber?: string | null;
  invitationType?: string | null;
};

type Event = {
  id: string;
  title: string;
  slug: string;
  gateSecret?: string | null;
  // ajoutez d'autres propriétés si nécessaires
};

const statusColors: Record<string, string> = {
  en_attente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  attending: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  annule: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  entre: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

const statusLabels: Record<string, string> = {
  en_attente: "En attente",
  attending: "Confirmé",
  annule: "Annulé",
  entre: "Entré",
};

export default function GuestList({
  guests,
  eventId,
  eventSlug,
  event,
}: {
  guests: Guest[];
  eventId: string;
  eventSlug: string;
  event: Event;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filteredGuests, setFilteredGuests] = useState(guests);
  const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    setFilteredGuests(
      query === ""
        ? guests
        : guests.filter(
            (g) =>
              g.firstName.toLowerCase().includes(query) ||
              g.lastName.toLowerCase().includes(query) ||
              g.invitationNumber?.toLowerCase().includes(query)
          )
    );
  };

  const handleRemove = (guestId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet invité ?")) return;
    startTransition(async () => {
      await removeGuest(guestId);
      router.refresh();
    });
  };

  const handleStatusChange = (guestId: string, status: string) => {
    startTransition(async () => {
      await updateGuestStatus(guestId, status);
      router.refresh();
    });
  };

  const copyInvitationLink = (guestId: string, firstName: string, lastName: string) => {
    const link = `${baseUrl}/invitation/${eventSlug}?firstName=${encodeURIComponent(
      firstName
    )}&lastName=${encodeURIComponent(lastName)}`;
    navigator.clipboard.writeText(link);
    setCopiedLinks((prev) => new Set(prev).add(guestId));
    alert("Lien copié !");
  };

  return (
    <div className="mt-4">
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Filtrer par nom ou numéro d'invitation..."
          value={search}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      {filteredGuests.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Aucun invité trouvé.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 text-left">N°</th>
                <th className="px-3 py-2 text-left">Nom</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Statut</th>
                <th className="px-3 py-2 text-left">Lien</th>
                <th className="px-3 py-2 text-left">Contrôle</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => {
                const statusKey = guest.status || "en_attente";
                const colorClass = statusColors[statusKey] || statusColors.en_attente;
                const label = statusLabels[statusKey] || "En attente";
                const isCopied = copiedLinks.has(guest.id);
                return (
                  <tr
                    key={guest.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-3 py-2 font-mono font-semibold">
                      {guest.invitationNumber || "—"}
                    </td>
                    <td className="px-3 py-2">
                      {guest.title
                        ? `${guest.title} ${guest.firstName} ${guest.lastName}`
                        : `${guest.firstName} ${guest.lastName}`}
                    </td>
                    <td className="px-3 py-2">
                      {guest.invitationType === "couple" ? (
                        <span className="flex items-center gap-1 text-purple-600">
                          <Users size={14} /> Couple
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-600">
                          <User size={14} /> Seul
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={guest.status || "en_attente"}
                        onChange={(e) => handleStatusChange(guest.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${colorClass}`}
                        disabled={isPending}
                      >
                        <option value="en_attente">En attente</option>
                        <option value="attending">Confirmé</option>
                        <option value="annule">Annulé</option>
                        <option value="entre">Entré</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyInvitationLink(guest.id, guest.firstName, guest.lastName)}
                          className="text-primary-500 hover:text-primary-700 transition"
                          title="Copier le lien d'invitation"
                        >
                          <Copy size={16} />
                        </button>
                        {isCopied && <CheckCircle size={16} className="text-green-500" />}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <GateQRButton guest={guest} event={event} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <EditGuestButton guest={guest} />
                        <button
                          onClick={() => handleRemove(guest.id)}
                          disabled={isPending}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}