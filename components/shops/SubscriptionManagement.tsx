"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";

export default function SubscriptionManagement({
  shopSlug,
  isVerified,
}: {
  shopSlug: string;
  isVerified: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/shops/${shopSlug}/subscription/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
        setShowConfirm(false);
      } else {
        setError(data.error || "Erreur lors de l'annulation.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Aucun abonnement actif. Souscrivez à un plan pour bénéficier de la vérification.
        </p>
        <button
          onClick={() => router.push(`/dashboard/shops/${shopSlug}/subscription`)}
          className="mt-3 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium transition"
        >
          Voir les offres
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {error && <div className="text-sm text-red-500 mb-3">{error}</div>}

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition"
        >
          Annuler l'abonnement
        </button>
      ) : (
        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                Êtes-vous sûr de vouloir annuler votre abonnement ?
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Votre boutique perdra le badge de vérification et les avantages associés.
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-3">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Annulation..." : "Oui, annuler"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Non, garder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}