"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldOff, Unlock, Lock, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface UserAdminControlsProps {
  userId: string;
  currentRole: string;
  currentStatus: boolean;
  userName: string;
  isSuperAdmin?: boolean; // si la cible est super admin
}

export default function UserAdminControls({
  userId,
  currentRole,
  currentStatus,
  userName,
  isSuperAdmin = false,
}: UserAdminControlsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [canCreate, setCanCreate] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const currentUserId = session?.user?.id;
  const currentUserIsSuperAdmin = session?.user?.isSuperAdmin === true;
  const isSelf = currentUserId === userId;
  const isTargetSuperAdmin = isSuperAdmin;
  const isTargetAdmin = currentRole === "ADMIN";

  // Un admin normal ne peut pas modifier un autre admin, ni soi-même
  const canModify = currentUserIsSuperAdmin
    ? true // super admin peut tout faire
    : !isSelf && !isTargetAdmin; // admin normal ne peut modifier que les utilisateurs non-admin et pas lui-même

  // Pour le bouton de suppression, on empêche la suppression d'un super admin (sauf si c'est le super admin lui-même)
  const canDelete = currentUserIsSuperAdmin
    ? true // super admin peut supprimer tout le monde (sauf lui-même géré plus bas)
    : !isSelf && !isTargetAdmin && !isTargetSuperAdmin;

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
      router.refresh();
      return true;
    }
    return false;
  };

  const deleteUser = async () => {
    if (isSelf) {
      alert("❌ Vous ne pouvez pas vous supprimer vous-même.");
      return;
    }
    if (isTargetSuperAdmin && !currentUserIsSuperAdmin) {
      alert("❌ Vous ne pouvez pas supprimer un Super Admin.");
      return;
    }
    if (!confirm(`Voulez-vous vraiment supprimer l'utilisateur ${userName} ? Cette action est irréversible.`)) return;
    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      alert(`✅ Utilisateur ${userName} supprimé.`);
      router.refresh();
    } else {
      alert("❌ Erreur lors de la suppression.");
    }
  };

  const handleToggleRole = () => {
    if (!canModify) {
      alert("Vous n'avez pas l'autorisation de modifier ce rôle.");
      return;
    }
    const newRole = role === "ADMIN" ? "USER" : "ADMIN";
    const action = newRole === "ADMIN" ? "promouvoir" : "révoquer les droits admin de";
    if (confirm(`Voulez-vous ${action} ${userName} ?`)) {
      startTransition(async () => {
        await updateUser({ role: newRole });
      });
    }
  };

  const handleToggleCreate = () => {
    if (!canModify) {
      alert("Vous n'avez pas l'autorisation de modifier ce statut.");
      return;
    }
    const newStatus = !canCreate;
    if (confirm(`Voulez-vous ${newStatus ? "activer" : "désactiver"} la création d'événements pour ${userName} ?`)) {
      startTransition(async () => {
        await updateUser({ canCreateEvents: newStatus });
      });
    }
  };

  // Si c'est la cible qui est un super admin et que l'utilisateur courant n'est pas super admin, on affiche un badge "Super Admin" sans boutons
  if (isTargetSuperAdmin && !currentUserIsSuperAdmin) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
        <Shield size={14} /> Super Admin
      </span>
    );
  }

  // Si l'utilisateur courant n'est pas admin du tout (normalement pas affiché)
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Bouton Rôle */}
      <button
        onClick={handleToggleRole}
        disabled={isPending || !canModify}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
          role === "ADMIN"
            ? "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
        } ${!canModify ? "opacity-50 cursor-not-allowed" : ""}`}
        title={!canModify ? "Action non autorisée" : role === "ADMIN" ? "Rétrograder" : "Promouvoir"}
      >
        {role === "ADMIN" ? <ShieldOff size={14} /> : <Shield size={14} />}
        {role === "ADMIN" ? "Rétrograder" : "Promouvoir"}
      </button>

      {/* Bouton Création */}
      <button
        onClick={handleToggleCreate}
        disabled={isPending || !canModify}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
          canCreate
            ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
            : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
        } ${!canModify ? "opacity-50 cursor-not-allowed" : ""}`}
        title={!canModify ? "Action non autorisée" : canCreate ? "Bloquer" : "Autoriser"}
      >
        {canCreate ? <Unlock size={14} /> : <Lock size={14} />}
        {canCreate ? "Autoriser" : "Bloquer"}
      </button>

      {/* Bouton Supprimer */}
      <button
        onClick={deleteUser}
        disabled={isPending || !canDelete}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 ${
          !canDelete ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title={!canDelete ? "Action non autorisée" : "Supprimer"}
      >
        <Trash2 size={14} /> Supprimer
      </button>
    </div>
  );
}