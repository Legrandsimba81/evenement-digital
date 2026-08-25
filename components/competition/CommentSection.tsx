"use client";

import { useEffect, useState } from "react";
import { addCompetitionComment, updateCompetitionComment } from "@/actions/competition-actions";
import { useSession } from "next-auth/react";
import { Pencil, Check, X, MessageSquare, Send } from "lucide-react";

type Comment = {
  id: string;
  content: string;
  authorName: string;
  authorId?: string | null;
  createdAt: Date | string;
};

export default function CommentSection({ postSlug, comments }: { postSlug: string; comments: Comment[] }) {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  // Synchronise les commentaires si les props changent
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  // Met à jour le nom si l'utilisateur est connecté
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]);

  const currentUserId = session?.user?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Détermine le nom de l'auteur
    const authorName = session?.user?.name?.trim() || name.trim();

    // Vérifications avant envoi
    if (!authorName || !content.trim()) return;

    setLoading(true);
    try {
      const newComment = await addCompetitionComment(postSlug, authorName, content.trim(), currentUserId);
      
      if (newComment) {
        setLocalComments((prev) => [newComment, ...prev]);
        setContent("");
        if (!session?.user) setName("");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du commentaire :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editingValue.trim()) return;
    try {
      const updated = await updateCompetitionComment(commentId, editingValue.trim());
      if (updated) {
        setLocalComments((prev) =>
          prev.map((comment) => (comment.id === commentId ? { ...comment, content: updated.content } : comment))
        );
        setEditingCommentId(null);
        setEditingValue("");
      }
    } catch (error) {
      console.error("Erreur mise à jour commentaire :", error);
    }
  };

  return (
    <section className="mt-12 border-t border-gray-100 dark:border-gray-800 pt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Commentaires ({localComments.length})
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        {!session?.user && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/60 dark:bg-amber-900/20 dark:text-amber-200">
            Vous pouvez laisser un commentaire avec votre nom ou vous connecter à votre compte.
          </div>
        )}

        {!session?.user && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom ou pseudo"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Laissez un message de soutien au candidat..."
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !content.trim() || (!session?.user && !name.trim())}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
          >
            <Send size={16} />
            {loading ? "Envoi..." : "Publier"}
          </button>
        </div>
      </form>

      {localComments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          Soyez le premier à soutenir cet article !
        </p>
      ) : (
        <div className="space-y-4">
          {localComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {comment.authorName}
                  </span>
                  <span>•</span>
                  <time className="text-xs">
                    {new Date(comment.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>

                {currentUserId && comment.authorId === currentUserId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCommentId(comment.id);
                      setEditingValue(comment.content);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition"
                  >
                    <Pencil size={13} /> Modifier
                  </button>
                )}
              </div>

              {editingCommentId === comment.id ? (
                <div className="mt-3 space-y-3">
                  <textarea
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => handleEdit(comment.id)}
                      className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                    >
                      <Check size={14} /> Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditingValue("");
                      }}
                      className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                      <X size={14} /> Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {comment.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}