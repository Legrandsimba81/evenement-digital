"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X, Users, Calendar } from "lucide-react";

interface AdminSearchProps {
  userSearch: string;
  eventSearch: string;
  userCount: number;
  eventCount: number;
}

export default function AdminSearch({ userSearch, eventSearch, userCount, eventCount }: AdminSearchProps) {
  const router = useRouter();
  const [userQuery, setUserQuery] = useState(userSearch);
  const [eventQuery, setEventQuery] = useState(eventSearch);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setUserQuery(userSearch);
    setEventQuery(eventSearch);
    setShowResults(!!(userSearch || eventSearch));
  }, [userSearch, eventSearch]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (userQuery) params.set("userSearch", userQuery);
    if (eventQuery) params.set("eventSearch", eventQuery);
    router.push(`/admin${params.toString() ? `?${params.toString()}` : ""}`);
    setShowResults(true);
  };

  const handleClear = () => {
    setUserQuery("");
    setEventQuery("");
    setShowResults(false);
    router.push("/admin");
  };

  const hasActiveSearch = !!(userSearch || eventSearch);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher un utilisateur (nom, email, téléphone)"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher un événement (titre, lieu, organisateur)"
            value={eventQuery}
            onChange={(e) => setEventQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-4">
          {hasActiveSearch && (
            <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users size={14} /> {userCount} utilisateur{userCount > 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {eventCount} événement{eventCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
          >
            <Search size={16} />
            Rechercher
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition flex items-center gap-1"
          >
            <X size={16} /> Effacer
          </button>
        </div>
      </div>
    </div>
  );
}