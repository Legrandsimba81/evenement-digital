"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";

const EVENT_TYPES = ["ANNIVERSAIRE", "SOUTENANCE", "MARIAGE", "CONCERT", "AUTRE"];
const EVENT_LABELS: Record<string, string> = {
  ANNIVERSAIRE: "Anniversaire",
  SOUTENANCE: "Soutenance",
  MARIAGE: "Mariage",
  CONCERT: "Concert",
  AUTRE: "Autre",
};

export default function CollaboratorLimitsClient({ users }: { users: any[] }) {
  const [editing, setEditing] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ userId: string; text: string; type: "success" | "error" } | null>(null);

  const initializeLimits = (user: any) => {
    const limits = user.collaboratorLimits as Record<string, number> | null || {};
    const initial: Record<string, string> = {};
    EVENT_TYPES.forEach((type) => {
      initial[type] = limits[type] !== undefined ? String(limits[type]) : "";
    });
    return initial;
  };

  const handleChange = (userId: string, type: string, value: string) => {
    setEditing((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [type]: value,
      },
    }));
  };

  const handleSave = async (userId: string) => {
    const limitsData = editing[userId] || {};
    const parsedLimits: Record<string, number> = {};
    EVENT_TYPES.forEach((type) => {
      const val = limitsData[type];
      if (val !== undefined && val !== "") {
        const num = Number(val);
        if (!isNaN(num) && num >= 0) {
          parsedLimits[type] = num;
        }
      }
    });

    setSaving(userId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/update-collaborator-limits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, limits: parsedLimits }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setMessage({ userId, text: "✅ Limites mises à jour", type: "success" });
      // Réinitialiser l'édition pour cet utilisateur
      setEditing((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    } catch (err: any) {
      setMessage({ userId, text: "❌ " + err.message, type: "error" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Limites de collaborateurs par utilisateur</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Définissez le nombre maximal de collaborateurs autorisés par type d'événement pour chaque utilisateur.
        Laissez vide pour utiliser la valeur par défaut (2).
      </p>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Utilisateur</th>
                {EVENT_TYPES.map((type) => (
                  <th key={type} className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    {EVENT_LABELS[type]}
                  </th>
                ))}
                <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const limits = user.collaboratorLimits as Record<string, number> | null || {};
                const edited = editing[user.id] || {};
                const isEditing = Object.keys(edited).length > 0;

                return (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">{user.name || "Anonyme"}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
                      </div>
                    </td>
                    {EVENT_TYPES.map((type) => {
                      const currentValue = edited[type] !== undefined ? edited[type] : (limits[type] !== undefined ? String(limits[type]) : "");
                      return (
                        <td key={type} className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={currentValue}
                            onChange={(e) => handleChange(user.id, type, e.target.value)}
                            placeholder="Illimité (défaut:2)"
                            className="w-20 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700"
                          />
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-center">
                      {message && message.userId === user.id && (
                        <span className={`text-xs ${message.type === "success" ? "text-green-600" : "text-red-600"} mr-2`}>
                          {message.text}
                        </span>
                      )}
                      <button
                        onClick={() => handleSave(user.id)}
                        disabled={saving === user.id || !isEditing}
                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition disabled:opacity-50"
                      >
                        {saving === user.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        {saving === user.id ? "Enregistrement..." : "Enregistrer"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}