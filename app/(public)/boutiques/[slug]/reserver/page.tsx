"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createReservation } from "@/actions/shop-actions";
import { Loader2 } from "lucide-react";

export default function ReservationPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Veuillez vous connecter pour réserver.");
      router.push("/login");
      return;
    }
    if (!date) {
      setError("Veuillez sélectionner une date.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createReservation(params.slug, new Date(date), message);
      setSuccess(true);
      setTimeout(() => router.push(`/boutiques/${params.slug}`), 2000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la réservation.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">✅ Réservation envoyée !</h1>
          <p className="text-gray-600">Le prestataire vous contactera bientôt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Réserver</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date souhaitée</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message (optionnel)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Dites-lui en quoi consiste votre événement..."
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Envoi en cours..." : "Envoyer la demande"}
          </button>
        </form>
      </div>
    </div>
  );
}