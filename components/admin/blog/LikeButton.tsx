"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleLike } from "@/actions/blog-actions";

export default function LikeButton({ postSlug, initialLikes, sessionId }: { postSlug: string; initialLikes: number; sessionId: string }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await toggleLike(postSlug, sessionId);
      setLikes(result.likes);
      setLiked(result.liked);
    } catch (error) {
      console.error("Erreur like:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-500 transition"
    >
      <Heart size={20} className={liked ? "fill-red-500 text-red-500" : ""} />
      <span>{likes}</span>
    </button>
  );
}