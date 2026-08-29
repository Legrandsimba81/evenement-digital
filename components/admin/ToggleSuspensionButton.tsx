"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Play, Pause } from "lucide-react";
import { toggleCompetitionSuspension } from "@/actions/toggle-suspension";

interface Props {
  initialSuspended: boolean;
  initialReason?: string | null;
}

export default function ToggleSuspensionButton({ initialSuspended, initialReason }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isSuspended, setIsSuspended] = useState(initialSuspended);

  const handleToggle = () => {
    const confirmMsg = isSuspended
      ? "Voulez-vous réactiver le concours ?"
      : "Voulez-vous vraiment suspendre le concours et envoyer un e-mail à tous les candidats ?";

    if (!confirm(confirmMsg)) return;

    startTransition(async () => {
      const nextState = !isSuspended;
      await toggleCompetitionSuspension(nextState);
      setIsSuspended(nextState);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
        isSuspended
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "bg-amber-500 hover:bg-amber-600 text-white"
      } disabled:opacity-50`}
    >
      {isSuspended ? (
        <>
          <Play size={16} />
          {isPending ? "Réactivation..." : "Réactiver le concours"}
        </>
      ) : (
        <>
          <Pause size={16} />
          {isPending ? "Suspension en cours..." : "Suspendre le concours"}
        </>
      )}
    </button>
  );
}