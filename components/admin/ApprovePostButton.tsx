"use client";

import { useState } from "react";
import { approvePost } from "@/actions/competition-actions";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface ApprovePostButtonProps {
  slug: string;
  currentStatus: "PENDING" | "APPROVED" | "REJECTED";
}

export default function ApprovePostButton({ slug, currentStatus }: ApprovePostButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await approvePost(slug);
    } catch (error) {
      console.error("Erreur lors de l'approbation :", error);
      alert("Erreur lors de la mise à jour du statut.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader2 size={18} className="animate-spin text-blue-500" />;
  }

  return (
    <div className="flex items-center gap-1">
      {currentStatus !== "APPROVED" && (
        <button
          onClick={handleApprove}
          title="Approuver l'article (+2$ au candidat)"
          className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition cursor-pointer"
        >
          <CheckCircle size={18} />
        </button>
      )}

      {currentStatus === "APPROVED" && (
        <span title="Déjà approuvé" className="p-1.5 text-emerald-500 opacity-60">
          <CheckCircle size={18} />
        </span>
      )}
    </div>
  );
}