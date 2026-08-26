"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  addCompetitionComment, 
  updateCompetitionComment, 
  deleteCompetitionComment 
} from "@/actions/competition-actions";
import { useSession } from "next-auth/react";
import { Pencil, Check, X, MessageSquare, Send, Trash2, User } from "lucide-react";

type Comment = {
  id: string;
  content: string;
  authorName: string;
  authorImage?: string | null;
  authorId?: string | null;
  createdAt: Date | string;
};

export default function CommentSection({ postSlug, comments }: { postSlug: string; comments: Comment[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
  const isAdmin = session?.user?.role === "ADMIN";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const authorName = session?.user?.name?.trim() || name.trim();

    if (!authorName || !content.trim()) return;

    setLoading(true);
    try {
      const newComment = await addCompetitionComment(postSlug, authorName, content.trim(), currentUserId);
      
      if (newComment) {
        const commentWithAvatar: Comment = {
          ...newComment,
          authorImage: session?.user?.image || null,
        };
        setLocalComments((prev) => [commentWithAvatar, ...prev]);
        setContent("");
        if (!session?.user) setName("");
        
        router.refresh();
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

  const handleDelete = async (commentId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce commentaire ?")) return;
    
    setDeletingId(commentId);
    try {
      await deleteCompetitionComment(commentId);
      setLocalComments((prev) => prev.filter((c) => c.id !== commentId));
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    } finally {
      setDeletingId(null);
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
          {localComments.map((comment) => {
            const canManage = currentUserId && (comment.authorId === currentUserId || isAdmin);

            return (
              <div
                key={comment.id}
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar de l'utilisateur ou icône par défaut */}
                    {comment.authorImage ? (
                      <img
                        src={comment.authorImage}
                        alt={comment.authorName}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
                        <User size={18} />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {comment.authorName}
                        </span>
                      </div>
                      <time className="text-xs text-gray-500 dark:text-gray-400 block">
                        {new Date(comment.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  </div>

                  {/* Actions de gestion : Édition et Suppression */}
                  {canManage && (
                    <div className="flex items-center gap-2">
                      {comment.authorId === currentUserId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditingValue(comment.content);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition"
                          title="Modifier"
                        >
                          <Pencil size={15} />
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={deletingId === comment.id}
                        onClick={() => handleDelete(comment.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition disabled:opacity-50"
                        title="Supprimer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Zone de contenu ou de modification */}
                {editingCommentId === comment.id ? (
                  <div className="mt-3 space-y-3">
                    <textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                  <p className="mt-3 text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line pl-12">
                    {comment.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}