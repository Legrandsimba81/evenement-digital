"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteCandidatePost } from "@/actions/competition-actions";

interface DeletePostButtonProps {
  slug: string;
  title: string;
}

export default function DeletePostButton({ slug, title }: DeletePostButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await deleteCandidatePost(slug);

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setIsOpen(false);
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bouton declencheur */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition cursor-pointer"
        title="Supprimer la candidature"
      >
        <Trash2 size={16} />
      </button>

      {/* Modale de confirmation */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Supprimer la candidature
              </h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              Êtes-vous sûr de vouloir supprimer l'article{" "}
              <span className="font-semibold text-slate-900 dark:text-white">"{title}"</span> ? 
              Cette action est irréversible.
            </p>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Confirmer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}