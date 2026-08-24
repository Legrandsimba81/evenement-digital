"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toggleLikePost } from "@/actions/competition-actions";

interface LikeButtonProps {
  postSlug: string;
  initialLikes: number;
  likedByCurrentUser: boolean;
}

// Interface pour le retour attendu de la Server Action
interface LikeActionResult {
  likes?: number;
  liked?: boolean;
}

export default function LikeButton({
  postSlug,
  initialLikes,
  likedByCurrentUser,
}: LikeButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(likedByCurrentUser);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (loading) return;

    const prevLiked = liked;
    const prevLikes = likes;

    // Mise à jour optimiste
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikes((prev) => (newLikedState ? prev + 1 : prev - 1));
    setLoading(true);

    try {
      // Cast explicite du résultat pour informer TypeScript
      const result = (await toggleLikePost(postSlug)) as LikeActionResult | undefined;

      if (result) {
        if (typeof result.likes === "number") setLikes(result.likes);
        if (typeof result.liked === "boolean") setLiked(result.liked);
      }
    } catch (error) {
      // Revert de l'interface en cas d'erreur
      setLiked(prevLiked);
      setLikes(prevLikes);
      console.error("Erreur lors du vote :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
        liked
          ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 shadow-sm hover:shadow-rose-500/20 active:scale-95"
      }`}
      title={liked ? "Retirer mon vote" : "Voter pour cet article"}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin text-rose-500" />
      ) : (
        <Heart
          size={18}
          className={`transition-transform duration-200 ${
            liked ? "fill-rose-500 text-rose-500 scale-110" : ""
          }`}
        />
      )}
      <span>{likes}</span>
      <span className="hidden sm:inline font-normal text-xs opacity-80">
        {liked ? "Voté" : "J'aime"}
      </span>
    </button>
  );
}