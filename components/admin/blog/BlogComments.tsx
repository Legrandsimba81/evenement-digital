"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { addComment } from "@/actions/blog-actions";

export default function BlogComments({ postSlug, comments }: { postSlug: string; comments: any[] }) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState(session?.user?.name || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await addComment(postSlug, authorName || "Anonyme", content, session?.user?.id);
    setContent("");
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!session?.user && (
          <input
            type="text"
            placeholder="Votre nom"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        )}
        <textarea
          rows={3}
          placeholder="Votre commentaire..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        />
        <button type="submit" disabled={loading} className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-medium transition disabled:opacity-50">
          {loading ? "Envoi..." : "Envoyer"}
        </button>
      </form>
      <div className="mt-6 space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
            <p className="font-medium text-gray-900 dark:text-white">{c.authorName}</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{c.content}</p>
            <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}