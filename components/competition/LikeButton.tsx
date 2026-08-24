"use client";

import { useState, useEffect } from "react";
import { toggleLikePost } from "@/actions/competition-actions";
import { Heart, Loader2 } from "lucide-react";

interface LikeButtonProps {
  postSlug: string;
  initialLikes: number;
}

export default function LikeButton({ postSlug, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Clé unique pour le stockage local basée sur le slug de l'article
  const storageKey = `liked_competition_${postSlug}`;

  useEffect(() => {
    const isLiked = localStorage.getItem(storageKey);
    if (isLiked) {
      setHasLiked(true);
    }
  }, [storageKey]);

  const handleLike = async () => {
    if (hasLiked || loading) return;

    // Mise à jour optimiste immédiate
    setHasLiked(true);
    setLikes((prev) => prev + 1);
    setLoading(true);

    try {
      localStorage.setItem(storageKey, "true");
      await toggleLikePost(postSlug);
    } catch (error: any) {
      // Revert en cas d'erreur
      setHasLiked(false);
      setLikes((prev) => prev - 1);
      localStorage.removeItem(storageKey);
      console.error("Erreur lors du like :", error);
      alert(error.message || "Une erreur est survenue lors du vote.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={hasLiked || loading}
      className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
        hasLiked
          ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 cursor-default"
          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 shadow-sm hover:shadow-rose-500/20 active:scale-95"
      }`}
      title={hasLiked ? "Vous avez déjà voté pour cet article" : "Aimer cet article"}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin text-rose-500" />
      ) : (
        <Heart
          size={18}
          className={`transition-transform duration-200 ${
            hasLiked ? "fill-rose-500 text-rose-500 scale-110" : "group-hover:scale-110"
          }`}
        />
      )}
      <span>{likes}</span>
      <span className="hidden sm:inline font-normal text-xs opacity-80">
        {hasLiked ? "Voté" : "J'aime"}
      </span>
    </button>
  );
}