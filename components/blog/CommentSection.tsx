"use client";

import { useState } from "react";
import { addComment } from "@/actions/blog-actions";
import { useSession } from "next-auth/react";

type Comment = {
  id: string;
  content: string;
  authorName: string;
  createdAt: Date;
};

export default function CommentSection({ postSlug, comments }: { postSlug: string; comments: Comment[] }) {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [localComments, setLocalComments] = useState(comments);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setLoading(true);
    try {
      const newComment = await addComment(postSlug, name.trim(), content.trim(), session?.user?.id);
      setLocalComments((prev) => [newComment, ...prev]);
      setContent("");
      if (!session?.user) setName("");
    } catch (error) {
      console.error("Erreur commentaire:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Commentaires ({localComments.length})</h3>
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        {!session?.user && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom"
            required
            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Votre commentaire..."
          required
          className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition disabled:opacity-50"
        >
          {loading ? "Envoi..." : "Envoyer"}
        </button>
      </form>
      {localComments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">Soyez le premier à commenter !</p>
      ) : (
        <div className="space-y-4">
          {localComments.map((comment) => (
            <div key={comment.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-800 dark:text-gray-200">{comment.authorName}</span>
                <span>•</span>
                <span>{new Date(comment.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}