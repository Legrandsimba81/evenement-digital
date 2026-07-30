"use client";

import { useState, useTransition } from "react";
import { Check, X, Eye } from "lucide-react";

interface TransactionActionsProps {
  transactionId: string;
  status: string;
  proofImage?: string | null;
}

export default function TransactionActions({
  transactionId,
  status,
  proofImage,
}: TransactionActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(status);

  const handleAction = async (newStatus: string) => {
    if (!confirm(`Confirmer le passage à ${newStatus === "completed" ? "validé" : "rejeté"} ?`)) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/transaction/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId, status: newStatus }),
        });
        if (res.ok) {
          setLocalStatus(newStatus);
          // Rafraîchir la page après un court délai pour voir les changements
          window.location.reload();
        } else {
          alert("Erreur lors de la mise à jour.");
        }
      } catch {
        alert("Erreur réseau.");
      }
    });
  };

  if (localStatus !== "pending") {
    return (
      <div className="flex items-center gap-1">
        {proofImage && (
          <a
            href={proofImage}
            target="_blank"
            className="text-blue-500 hover:text-blue-700 p-1"
            title="Voir la preuve"
          >
            <Eye size={16} />
          </a>
        )}
        <span className="text-xs text-gray-400">
          {localStatus === "completed" ? "✅" : "❌"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {proofImage && (
        <a
          href={proofImage}
          target="_blank"
          className="text-blue-500 hover:text-blue-700 p-1"
          title="Voir la preuve"
        >
          <Eye size={16} />
        </a>
      )}
      <button
        onClick={() => handleAction("completed")}
        disabled={isPending}
        className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition disabled:opacity-50"
        title="Valider"
      >
        <Check size={16} />
      </button>
      <button
        onClick={() => handleAction("failed")}
        disabled={isPending}
        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition disabled:opacity-50"
        title="Rejeter"
      >
        <X size={16} />
      </button>
    </div>
  );
}