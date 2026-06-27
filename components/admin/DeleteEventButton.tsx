"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEventAsAdmin } from "@/actions/event-actions";

export default function DeleteEventButton({ slug, title }: { slug: string; title: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Voulez-vous vraiment supprimer l'événement "${title}" ? Cette action est irréversible.`)) {
      startTransition(async () => {
        await deleteEventAsAdmin(slug);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 transition disabled:opacity-50"
      title="Supprimer cet événement"
    >
      <Trash2 size={16} />
      {isPending ? "..." : "Supprimer"}
    </button>
  );
}