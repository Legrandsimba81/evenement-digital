"use client";

import { useState, useTransition } from "react";
import { Shield, ShieldOff, Unlock, Lock, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface UserAdminControlsProps {
  userId: string;
  currentRole: string;
  currentStatus: boolean;
  userName: string;
  isSuperAdmin?: boolean; // optionnel
}

export default function UserAdminControls({
  userId,
  currentRole,
  currentStatus,
  userName,
  isSuperAdmin = false,
}: UserAdminControlsProps) {
  const { data: session } = useSession();
  const [role, setRole] = useState(currentRole);
  const [canCreate, setCanCreate] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const currentUserId = session?.user?.id;
  const isSelf = currentUserId === userId;
  const isCurrentUserSuperAdmin = session?.user?.isSuperAdmin === true; // à définir dans la session

  // Règles :
  // - Un superadmin peut tout faire.
  // - Un admin normal ne peut pas modifier un autre admin (ni soi-même).
  // - Personne ne peut modifier un superadmin.
  const isTargetSuperAdmin = isSuperAdmin;
  const isTargetAdmin = currentRole === "ADMIN";

  // Si la cible est un superadmin, on n'affiche aucun bouton (juste un badge)
  if (isTargetSuperAdmin) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
        <Shield size={14} /> Super Admin
      </span>
    );
  }

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
    if (isSelf) {
      alert("❌ Vous ne pouvez pas vous supprimer vous-même.");
      return;
    }
    if (isTargetAdmin && !isCurrentUserSuperAdmin) {
      alert("❌ Vous ne pouvez pas supprimer un autre administrateur.");
      return;
    }
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
    if (isSelf) {
      alert("❌ Vous ne pouvez pas modifier votre propre rôle.");
      return;
    }
    if (isTargetAdmin && !isCurrentUserSuperAdmin) {
      alert("❌ Vous ne pouvez pas révoquer les droits d'un autre administrateur.");
      return;
    }
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
    if (isSelf) {
      alert("❌ Vous ne pouvez pas modifier votre propre statut.");
      return;
    }
    if (isTargetAdmin && !isCurrentUserSuperAdmin) {
      alert("❌ Vous ne pouvez pas bloquer/débloquer un autre administrateur.");
      return;
    }
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
      {/* Bouton Rôle */}
      <button
        onClick={handleToggleRole}
        disabled={isPending || isSelf || (isTargetAdmin && !isCurrentUserSuperAdmin)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
          role === "ADMIN"
            ? "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
        } ${isPending || isSelf || (isTargetAdmin && !isCurrentUserSuperAdmin) ? "opacity-50 cursor-not-allowed" : ""}`}
        title={
          isSelf
            ? "Vous ne pouvez pas modifier votre propre rôle"
            : isTargetAdmin && !isCurrentUserSuperAdmin
            ? "Vous ne pouvez pas modifier un autre administrateur"
            : role === "ADMIN"
            ? "Révoquer les droits admin"
            : "Promouvoir administrateur"
        }
      >
        {role === "ADMIN" ? <ShieldOff size={14} /> : <Shield size={14} />}
        {role === "ADMIN" ? "Rétrograder" : "Promouvoir"}
      </button>

      {/* Bouton Création */}
      <button
        onClick={handleToggleCreate}
        disabled={isPending || isSelf || (isTargetAdmin && !isCurrentUserSuperAdmin)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
          canCreate
            ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
            : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
        } ${isPending || isSelf || (isTargetAdmin && !isCurrentUserSuperAdmin) ? "opacity-50 cursor-not-allowed" : ""}`}
        title={
          isSelf
            ? "Vous ne pouvez pas modifier votre propre statut"
            : isTargetAdmin && !isCurrentUserSuperAdmin
            ? "Vous ne pouvez pas modifier un autre administrateur"
            : canCreate
            ? "Bloquer la création"
            : "Autoriser la création"
        }
      >
        {canCreate ? <Unlock size={14} /> : <Lock size={14} />}
        {canCreate ? "Autoriser" : "Bloquer"}
      </button>

      {/* Bouton Supprimer */}
      <button
        onClick={deleteUser}
        disabled={isPending || isSelf || (isTargetAdmin && !isCurrentUserSuperAdmin)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 ${
          isPending || isSelf || (isTargetAdmin && !isCurrentUserSuperAdmin) ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title={
          isSelf
            ? "Vous ne pouvez pas vous supprimer vous-même"
            : isTargetAdmin && !isCurrentUserSuperAdmin
            ? "Vous ne pouvez pas supprimer un autre administrateur"
            : "Supprimer définitivement"
        }
      >
        <Trash2 size={14} /> Supprimer
      </button>
    </div>
  );
}