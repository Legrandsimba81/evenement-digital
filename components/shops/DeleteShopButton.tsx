"use client";

import { useTransition } from "react";
import { deleteShop } from "@/actions/shop-actions";
import { Trash2 } from "lucide-react";

export default function DeleteShopButton({ slug, name }: { slug: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Supprimer la boutique "${name}" ?`)) return;
    startTransition(async () => {
      await deleteShop(slug);
    });
  };

  return (
    <button onClick={handleDelete} disabled={isPending} className="text-red-500 hover:text-red-700">
      <Trash2 size={18} />
    </button>
  );
}