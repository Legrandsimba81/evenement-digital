"use client";

import { useState, useTransition } from "react";
import { Shield, ShieldOff, Unlock, Lock, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const [role, setRole] = useState(currentRole);
  const [canCreate, setCanCreate] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  // Vérifier si l'utilisateur connecté est admin
  const isAdmin = session?.user?.role === "ADMIN";
  // Vérifier si l'utilisateur cible est admin
  const isTargetAdmin = role === "ADMIN";
  // Vérifier si on essaie de modifier ses propres droits
  const isSelf = session?.user?.id === userId;

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
    // Empêcher la révocation des droits admin d'un autre admin ou de soi-même
    if (isTargetAdmin || isSelf) {
      alert("❌ Impossible de modifier les droits d'un administrateur.");
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
    // Ne pas bloquer/débloquer un admin (ou soi-même) pour éviter de se couper l'accès
    if (isTargetAdmin || isSelf) {
      alert("❌ Impossible de modifier le statut de création d'un administrateur.");
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
      {/* Toggle rôle - ne pas afficher si c'est un admin ou soi-même */}
      {!isTargetAdmin && !isSelf && (
        <button
          onClick={handleToggleRole}
          disabled={isPending}
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
          title={role === "ADMIN" ? "Révoquer admin" : "Promouvoir admin"}
        >
          {role === "ADMIN" ? (
            <>
              <ShieldOff size={14} /> Rétrograder
            </>
          ) : (
            <>
              <Shield size={14} /> Promouvoir
            </>
          )}
        </button>
      )}

      {/* Toggle canCreate - ne pas afficher si c'est un admin ou soi-même */}
      {!isTargetAdmin && !isSelf && (
        <button
          onClick={handleToggleCreate}
          disabled={isPending}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${
            canCreate
              ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
              : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
          }`}
          title={canCreate ? "Bloquer création" : "Autoriser création"}
        >
          {canCreate ? (
            <>
              <Unlock size={14} /> Autoriser
            </>
          ) : (
            <>
              <Lock size={14} /> Bloquer
            </>
          )}
        </button>
      )}

      {/* Supprimer - ne pas afficher si c'est soi-même */}
      {!isSelf && (
        <button
          onClick={deleteUser}
          disabled={isPending}
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 transition"
          title="Supprimer cet utilisateur"
        >
          <Trash2 size={14} /> Supprimer
        </button>
      )}
    </div>
  );
}