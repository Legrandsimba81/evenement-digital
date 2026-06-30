"use client";

import { useState, useTransition } from "react";
import { Lock, Unlock } from "lucide-react";

export default function ToggleUserStatusButton({ userId, currentStatus, userName }: { userId: string; currentStatus: boolean; userName: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async () => {
    const newStatus = !status;
    if (confirm(`Voulez-vous ${newStatus ? "activer" : "désactiver"} ${userName} ?`)) {
      startTransition(async () => {
        const res = await fetch("/api/admin/toggle-user-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, canCreateEvents: newStatus }),
        });
        if (res.ok) {
          setStatus(newStatus);
          alert(`✅ Utilisateur ${newStatus ? "activé" : "désactivé"} avec succès !`);
        } else {
          alert("Erreur lors de la modification du statut.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-2 py-1 rounded-full text-xs font-medium transition ${
        status
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : "bg-red-100 text-red-800 hover:bg-red-200"
      }`}
      title={status ? "Désactiver" : "Réactiver"}
    >
      {isPending ? (
        "Chargement..."
      ) : status ? (
        <span className="flex items-center gap-1"><Unlock size={12} /> Actif</span>
      ) : (
        <span className="flex items-center gap-1"><Lock size={12} /> Désactivé</span>
      )}
    </button>
  );
}