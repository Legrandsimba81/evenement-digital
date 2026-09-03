"use client";

import { useState } from "react";
import { toggleEventPaid } from "@/actions/event-actions";
import { useRouter } from "next/navigation";

export default function TogglePaidButton({
  slug,
  initialIsPaid,
}: {
  slug: string;
  initialIsPaid: boolean;
}) {
  const [isPaid, setIsPaid] = useState(initialIsPaid);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await toggleEventPaid(slug);
      if (result.success) {
        setIsPaid(result.isPaid);
        router.refresh(); // Rafraîchit la page
      } else {
        alert("Erreur lors du changement");
      }
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-1 text-xs font-medium rounded-full transition ${
        isPaid
          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? "..." : isPaid ? "✅ Payant" : "⬜ Gratuit"}
    </button>
  );
}