// components/shops/ReviewForm.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { addReview } from "@/actions/shop-actions";
import { Star, Loader2 } from "lucide-react";

export default function ReviewForm({ shopSlug }: { shopSlug: string }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!session) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        <a href="/login" className="text-blue-600 hover:underline">Connectez-vous</a> pour laisser un avis.
      </p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une note.' });
      return;
    }
    setIsSubmitting(true);
    setMessage(null);

    try {
      await addReview(shopSlug, { rating, comment: comment.trim() || undefined });
      setMessage({ type: 'success', text: 'Merci pour votre avis ! Il sera affiché après validation.' });
      setRating(0);
      setComment("");
      // Recharger la page pour voir le nouvel avis (ou on peut optimiser avec un état local)
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "Une erreur est survenue." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">Donnez votre avis</h3>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="focus:outline-none"
              >
                <Star
                  size={24}
                  className={`${
                    star <= (hover || rating)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300 dark:text-gray-600"
                  } transition`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {rating > 0 ? `${rating} / 5` : "Sélectionnez"}
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Commentaire (optionnel)</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Partagez votre expérience..."
          />
        </div>
        {message && (
          <div className={`text-sm p-2 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
            {message.text}
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Envoyer l'avis"}
        </button>
      </form>
    </div>
  );
}