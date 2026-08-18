"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createReservation } from "@/actions/shop-actions";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

export default function ReservationForm({ shopSlug }: { shopSlug: string }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await createReservation(shopSlug, { date, message: message.trim() || undefined });
      setSuccess(true);
      setTimeout(() => router.push(`/boutiques/${shopSlug}`), 2000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date souhaitée *</label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message (optionnel)</label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Détails de votre événement, nombre d'invités, besoins spécifiques..."
          className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      {error && <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</div>}
      {success && <div className="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">✅ Demande envoyée ! Redirection...</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-xl transition disabled:opacity-50 shadow-sm"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <CalendarIcon size={18} />}
        {loading ? "Envoi en cours..." : "Envoyer la demande"}
      </button>
    </form>
  );
}