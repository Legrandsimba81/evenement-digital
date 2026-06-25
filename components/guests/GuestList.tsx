"use client";

import { useState, useTransition } from "react";
import { removeGuest } from "@/actions/guest-actions";
import EditGuestButton from "@/components/guests/EditGuestButton";
import { Search } from "lucide-react";

export default function GuestList({ guests, eventId }: { guests: any[]; eventId: string }) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filteredGuests, setFilteredGuests] = useState(guests);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    if (query === "") {
      setFilteredGuests(guests);
    } else {
      setFilteredGuests(
        guests.filter(
          (g) =>
            g.firstName.toLowerCase().includes(query) ||
            g.lastName.toLowerCase().includes(query)
        )
      );
    }
  };

  const handleRemove = (guestId: string) => {
    startTransition(async () => {
      await removeGuest(guestId);
    });
  };

  return (
    <div className="mt-4">
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Filtrer par nom..."
          value={search}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      {filteredGuests.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Aucun invité trouvé.</p>
      ) : (
        <ul className="space-y-2">
          {filteredGuests.map((guest) => (
            <li
              key={guest.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-700 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {guest.title ? `${guest.title} ${guest.firstName} ${guest.lastName}` : `${guest.firstName} ${guest.lastName}`}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 sm:mt-0">
                <EditGuestButton guest={guest} />
                <button
                  onClick={() => handleRemove(guest.id)}
                  disabled={isPending}
                  className="text-red-500 hover:underline text-sm disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}