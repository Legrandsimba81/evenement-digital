"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";

const EVENT_TYPES = ["ANNIVERSAIRE", "SOUTENANCE", "MARIAGE", "CONCERT", "AUTRE"];
const EVENT_LABELS: Record<string, string> = {
  ANNIVERSAIRE: "Anniversaire",
  SOUTENANCE: "Soutenance",
  MARIAGE: "Mariage",
  CONCERT: "Concert",
  AUTRE: "Autre",
};

interface UserLimitsModalProps {
  userId: string;
  currentLimits: Record<string, number | null> | null;
  userName: string;
  onClose: () => void;
}

export default function UserLimitsModal({
  userId,
  currentLimits,
  userName,
  onClose,
}: UserLimitsModalProps) {
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const initial: Record<string, string> = {};
    EVENT_TYPES.forEach((type) => {
      const val = currentLimits?.[type];
      initial[type] = val === null || val === undefined ? "" : String(val);
    });
    setLimits(initial);
  }, [currentLimits]);

  const handleChange = (type: string, value: string) => {
    setLimits((prev) => ({ ...prev, [type]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const parsedLimits: Record<string, number | null> = {};
    EVENT_TYPES.forEach((type) => {
      const val = limits[type];
      parsedLimits[type] = val === "" ? null : Number(val);
    });

    try {
      const res = await fetch("/api/admin/user/update-limits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, limits: parsedLimits }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      onClose();
      // Recharger la page après mise à jour
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Limites d'événements – {userName}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Définissez le nombre maximal d'invités autorisé pour chaque type d'événement.
            Laissez vide pour illimité.
          </p>

          {EVENT_TYPES.map((type) => (
            <div key={type}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {EVENT_LABELS[type]}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={limits[type] || ""}
                onChange={(e) => handleChange(type, e.target.value)}
                placeholder="Illimité"
                className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl transition font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}