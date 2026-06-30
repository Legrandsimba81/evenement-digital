"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";

interface UserStatusToggleProps {
  userId: string;
  currentStatus: boolean;
  userName: string;
}

export default function UserStatusToggle({ userId, currentStatus, userName }: UserStatusToggleProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const newStatus = !status;
    const action = newStatus ? "activer" : "désactiver";
    if (!confirm(`Voulez-vous vraiment ${action} ${userName || "cet utilisateur"} ?`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/toggle-user-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, canCreateEvents: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(newStatus);
        alert(data.message);
        window.location.reload();
      } else {
        alert(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      alert("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-2 py-1 rounded-full text-xs font-medium transition ${
        status
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : "bg-red-100 text-red-800 hover:bg-red-200"
      }`}
      title={status ? "Désactiver" : "Réactiver"}
    >
      {status ? (
        <span className="flex items-center gap-1"><Unlock size={12} /> Actif</span>
      ) : (
        <span className="flex items-center gap-1"><Lock size={12} /> Désactivé</span>
      )}
    </button>
  );
}