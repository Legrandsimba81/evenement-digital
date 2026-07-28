"use client";

import { useState, useTransition } from "react";
import { Shield, ShieldOff, Unlock, Lock, Trash2 } from "lucide-react";

interface UserAdminControlsProps {
  userId: string;
  currentRole: string;
  currentStatus: boolean;
  userName: string;
}

export default function UserAdminControls({
  userId,
  currentRole,
  currentStatus,
  userName,
}: UserAdminControlsProps) {
  const [role, setRole] = useState(currentRole);
  const [canCreate, setCanCreate] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const updateUser = async (data: { role?: string; canCreateEvents?: boolean }) => {
    const res = await fetch("/api/admin/update-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...data }),
    });
    if (res.ok) {
      const updated = await res.json();
      if (data.role !== undefined) setRole(updated.role);
      if (data.canCreateEvents !== undefined) setCanCreate(updated.canCreateEvents);
      return true;
    }
    return false;
  };

  const deleteUser = async () => {
    if (confirm(`Supprimer définitivement ${userName} ? Cette action est irréversible.`)) {
      startTransition(async () => {
        const res = await fetch("/api/admin/delete-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (res.ok) {
          alert(`✅ Utilisateur ${userName} supprimé.`);
          // Recharger la page pour actualiser la liste
          window.location.reload();
        } else {
          alert("❌ Erreur lors de la suppression.");
        }
      });
    }
  };

  const handleToggleRole = () => {
    const newRole = role === "ADMIN" ? "USER" : "ADMIN";
    const action = newRole === "ADMIN" ? "promouvoir" : "révoquer les droits admin de";
    if (confirm(`Voulez-vous ${action} ${userName} ?`)) {
      startTransition(async () => {
        const success = await updateUser({ role: newRole });
        if (success) {
          alert(`✅ ${userName} est maintenant ${newRole === "ADMIN" ? "administrateur" : "utilisateur standard"}.`);
        } else {
          alert("❌ Erreur lors de la modification du rôle.");
        }
      });
    }
  };

  const handleToggleCreate = () => {
    const newStatus = !canCreate;
    if (confirm(`Voulez-vous ${newStatus ? "activer" : "désactiver"} la création d'événements pour ${userName} ?`)) {
      startTransition(async () => {
        const success = await updateUser({ canCreateEvents: newStatus });
        if (success) {
          alert(`✅ Création d'événements ${newStatus ? "activée" : "désactivée"} pour ${userName}.`);
        } else {
          alert("❌ Erreur lors de la modification du statut.");
        }
      });
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Toggle rôle */}
      <button
        onClick={handleToggleRole}
        disabled={isPending}
        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        title={role === "ADMIN" ? "Révoquer admin" : "Promouvoir admin"}
      >
        {role === "ADMIN" ? (
          <Shield size={16} className="text-purple-600 dark:text-purple-400" />
        ) : (
          <ShieldOff size={16} className="text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* Toggle canCreate */}
      <button
        onClick={handleToggleCreate}
        disabled={isPending}
        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        title={canCreate ? "Bloquer création" : "Autoriser création"}
      >
        {canCreate ? (
          <Unlock size={16} className="text-green-600 dark:text-green-400" />
        ) : (
          <Lock size={16} className="text-red-600 dark:text-red-400" />
        )}
      </button>

      {/* Supprimer */}
      <button
        onClick={deleteUser}
        disabled={isPending}
        className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition"
        title="Supprimer cet utilisateur"
      >
        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
      </button>
    </div>
  );
}