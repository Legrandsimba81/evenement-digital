// components/admin/UserAdminActions.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldOff, Unlock, Lock, Trash2 } from "lucide-react";

interface UserAdminActionsProps {
  userId: string;
  currentRole: string;
  currentStatus: boolean;
  userName: string;
}

export default function UserAdminActions({
  userId,
  currentRole,
  currentStatus,
  userName,
}: UserAdminActionsProps) {
  const router = useRouter();
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
      // Rafraîchir la page pour refléter les changements dans la liste
      router.refresh();
      return true;
    }
    return false;
  };

  const deleteUser = async () => {
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
    const newRole = role === "ADMIN" ? "USER" : "ADMIN";
    const action = newRole === "ADMIN" ? "promouvoir" : "révoquer les droits admin de";
    if (confirm(`Voulez-vous ${action} ${userName} ?`)) {
      startTransition(async () => {
        await updateUser({ role: newRole });
      });
    }
  };

  const handleToggleCreate = () => {
    const newStatus = !canCreate;
    if (confirm(`Voulez-vous ${newStatus ? "activer" : "désactiver"} la création d'événements pour ${userName} ?`)) {
      startTransition(async () => {
        await updateUser({ canCreateEvents: newStatus });
      });
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <button
        onClick={handleToggleRole}
        disabled={isPending}
        className={`p-1.5 rounded-md transition-colors ${
          role === "ADMIN"
            ? "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
        }`}
        title={role === "ADMIN" ? "Révoquer admin" : "Promouvoir admin"}
      >
        {role === "ADMIN" ? <Shield size={16} /> : <ShieldOff size={16} />}
      </button>

      <button
        onClick={handleToggleCreate}
        disabled={isPending}
        className={`p-1.5 rounded-md transition-colors ${
          canCreate
            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
            : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
        }`}
        title={canCreate ? "Bloquer création" : "Permettre création"}
      >
        {canCreate ? <Unlock size={16} /> : <Lock size={16} />}
      </button>

      <button
        onClick={deleteUser}
        disabled={isPending}
        className="p-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 transition-colors"
        title="Supprimer l'utilisateur"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}