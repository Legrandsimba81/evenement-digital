"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";

export default function CertifyToggle({
  shopSlug,
  isVerified,
}: {
  shopSlug: string;
  isVerified: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const toggleCertify = async () => {
    const newStatus = !isVerified;
    const res = await fetch(`/api/admin/shops/${shopSlug}/certify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certified: newStatus }),
    });
    if (res.ok) {
      // Rafraîchir la page (router.refresh())
      window.location.reload();
    } else {
      alert("Erreur lors de la mise à jour de la certification.");
    }
  };

  return (
    <button
      onClick={() => startTransition(toggleCertify)}
      disabled={isPending}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition ${
        isVerified
          ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {isVerified ? (
        <>
          <Check size={12} /> Certifié
        </>
      ) : (
        <>
          <X size={12} /> Non certifié
        </>
      )}
    </button>
  );
}