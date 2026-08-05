"use client";

import { useMemo, useState } from "react";
import { addComment, updateComment } from "@/actions/blog-actions";
import { useSession } from "next-auth/react";
import { Pencil, Check, X } from "lucide-react";

type Comment = {
  id: string;
  content: string;
  authorName: string;
  authorId?: string | null;
  createdAt: Date;
};

export default function CommentSection({ postSlug, comments }: { postSlug: string; comments: Comment[] }) {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [localComments, setLocalComments] = useState(comments);

  const currentUserId = session?.user?.id;

  const canComment = useMemo(() => Boolean(session?.user), [session?.user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canComment) return;
    if (!content.trim()) return;
    setLoading(true);
    try {
      const newComment = await addComment(postSlug, session?.user?.name?.trim() || name.trim(), content.trim(), currentUserId);
      setLocalComments((prev) => [newComment, ...prev]);
      setContent("");
      if (!session?.user) setName("");
    } catch (error) {
      console.error("Erreur commentaire:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editingValue.trim()) return;
    try {
      const updated = await updateComment(commentId, editingValue.trim());
      setLocalComments((prev) => prev.map((comment) => comment.id === commentId ? { ...comment, content: updated.content } : comment));
      setEditingCommentId(null);
      setEditingValue("");
    } catch (error) {
      console.error("Erreur mise à jour commentaire:", error);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Commentaires ({localComments.length})</h3>
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        {!canComment && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/60 dark:bg-amber-900/20 dark:text-amber-200">
            Connectez-vous pour publier un commentaire.
          </div>
        )}
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
          disabled={loading || !canComment}
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
              <div className="flex items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{comment.authorName}</span>
                  <span>•</span>
                  <span>{new Date(comment.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                {session?.user?.id && comment.authorId === session.user.id && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCommentId(comment.id);
                      setEditingValue(comment.content);
                    }}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <Pencil size={14} /> Modifier
                  </button>
                )}
              </div>

              {editingCommentId === comment.id ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEdit(comment.id)} className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
                      <Check size={14} /> Enregistrer
                    </button>
                    <button type="button" onClick={() => { setEditingCommentId(null); setEditingValue(""); }} className="inline-flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg text-sm">
                      <X size={14} /> Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}