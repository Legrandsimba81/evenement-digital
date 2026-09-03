// components/shops/ReservationForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createReservation } from "@/actions/shop-actions";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

export default function ReservationForm({ shopSlug }: { shopSlug: string }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Pré-remplir avec les données de l'utilisateur
  useEffect(() => {
    if (session?.user) {
      setClientName(session.user.name || "");
      setClientEmail(session.user.email || "");
      // On peut aussi récupérer le téléphone depuis le profil utilisateur si stocké
      // Pour l'instant, on laisse vide
    }
  }, [session]);

  if (!session) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        <a href="/login" className="text-blue-600 hover:underline">Connectez-vous</a> pour réserver.
      </p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!clientName.trim() || !clientEmail.trim()) {
      setError("Veuillez remplir votre nom et email.");
      setLoading(false);
      return;
    }

    try {
      await createReservation(shopSlug, {
        date,
        message: message.trim() || undefined,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim() || undefined,
        clientWhatsapp: clientWhatsapp.trim() || undefined,
      });
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
      {/* Nom */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet *</label>
        <input
          type="text"
          required
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
        <input
          type="email"
          required
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Téléphone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
        <input
          type="tel"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          placeholder="0827733286"
          className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* WhatsApp */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp</label>
        <input
          type="tel"
          value={clientWhatsapp}
          onChange={(e) => setClientWhatsapp(e.target.value)}
          placeholder="0827733286"
          className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Date */}
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

      {/* Message */}
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
      {success && <div className="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">Demande envoyée ! Redirection...</div>}

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