"use client";

import { useTransition } from "react";
import { deleteShop } from "@/actions/shop-actions";
import { Trash2 } from "lucide-react";

export default function DeleteShopButton({ slug, name }: { slug: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Supprimer définitivement la boutique "${name}" ? Cette action est irréversible.`)) return;
    startTransition(async () => {
      await deleteShop(slug);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition text-red-500 hover:text-red-700"
      title="Supprimer"
    >
      <Trash2 size={16} />
    </button>
  );
}