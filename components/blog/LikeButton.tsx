"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toggleLike } from "@/actions/blog-actions";

export default function LikeButton({ postSlug, initialLikes, likedByCurrentUser }: { postSlug: string; initialLikes: number; likedByCurrentUser: boolean }) {
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
    setLoading(true);
    try {
      const result = await toggleLike(postSlug);
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
      type="button"
      onClick={handleLike}
      className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-500 transition"
    >
      <Heart size={20} className={liked ? "fill-red-500 text-red-500" : ""} />
      <span>{likes}</span>
    </button>
  );
}