"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";

export default function TransactionActions({ transactionId, status }: { transactionId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  const updateStatus = async (newStatus: string) => {
    if (!confirm(`Confirmer le passage à ${newStatus === "completed" ? "validé" : "rejeté"} ?`)) return;
    startTransition(async () => {
      const res = await fetch("/api/admin/transaction/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, status: newStatus }),
      });
      if (res.ok) {
        alert("Statut mis à jour");
        window.location.reload();
      } else {
        alert("Erreur lors de la mise à jour");
      }
    });
  };

  if (status !== "pending") {
    return (
      <span className="text-xs text-gray-400">
        {status === "completed" ? "✅ Validé" : "❌ Rejeté"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => updateStatus("completed")}
        disabled={isPending}
        className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition"
        title="Valider"
      >
        <Check size={16} />
      </button>
      <button
        onClick={() => updateStatus("failed")}
        disabled={isPending}
        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition"
        title="Rejeter"
      >
        <X size={16} />
      </button>
    </div>
  );
}