"use client";

import { useTransition } from "react";
import { deleteBlogPost } from "@/actions/blog-actions";
import { Trash2 } from "lucide-react";

export default function DeletePostButton({ slug, title }: { slug: string; title: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Supprimer l'article "${title}" ?`)) return;
    startTransition(async () => {
      await deleteBlogPost(slug);
    });
  };

  return (
    <button onClick={handleDelete} disabled={isPending} className="text-red-500 hover:text-red-700" title="Supprimer">
      <Trash2 size={16} />
    </button>
  );
}