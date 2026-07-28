"use client";

import { useState, useTransition } from "react";
import { Shield, ShieldOff, Unlock, Lock, Trash2 } from "lucide-react";

interface UserAdminControlsProps {
  userId: string;
  currentRole: string;
  currentStatus: boolean;
  userName: string;
  currentUserId: string; // Ajouté
}

export default function UserAdminControls({
  userId,
  currentRole,
  currentStatus,
  userName,
  currentUserId,
}: UserAdminControlsProps) {
  const [role, setRole] = useState(currentRole);
  const [canCreate, setCanCreate] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const isSelf = currentUserId === userId;
  const isOtherAdmin = currentRole === "ADMIN" && !isSelf;
  const canModifyRole = !isSelf && !isOtherAdmin;

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
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handleToggleRole}
        disabled={isPending || !canModifyRole}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1 ${
          role === "ADMIN"
            ? "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
        } ${!canModifyRole ? "opacity-50 cursor-not-allowed" : ""}`}
        title={
          isSelf
            ? "Vous ne pouvez pas modifier votre propre rôle"
            : isOtherAdmin
            ? "Impossible de révoquer un autre administrateur"
            : role === "ADMIN"
            ? "Révoquer les droits admin"
            : "Promouvoir administrateur"
        }
      >
        {role === "ADMIN" ? <Shield size={14} /> : <ShieldOff size={14} />}
        {role === "ADMIN" ? "Admin" : "Utilisateur"}
      </button>

      <button
        onClick={handleToggleCreate}
        disabled={isPending || isSelf}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1 ${
          canCreate
            ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
            : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
        } ${isSelf ? "opacity-50 cursor-not-allowed" : ""}`}
        title={isSelf ? "Vous ne pouvez pas modifier votre propre statut" : canCreate ? "Bloquer la création" : "Autoriser la création"}
      >
        {canCreate ? <Unlock size={14} /> : <Lock size={14} />}
        {canCreate ? "Créer" : "Bloqué"}
      </button>

      <button
        onClick={deleteUser}
        disabled={isPending || isSelf}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 ${
          isSelf ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title={isSelf ? "Vous ne pouvez pas vous supprimer vous-même" : "Supprimer définitivement"}
      >
        <Trash2 size={14} />
        Supprimer
      </button>
    </div>
  );
}