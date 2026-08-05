"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBlogPost, updateBlogPost } from "@/actions/blog-actions";

export default function PostForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [published, setPublished] = useState(initialData?.published ?? true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await updateBlogPost(initialData.id, { title, content, excerpt, imageUrl, published });
      } else {
        await createBlogPost({ title, content, excerpt, imageUrl });
      }
      router.push("/admin/posts");
      router.refresh();
    } catch (error) {
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contenu (HTML)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          required
          className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Vous pouvez utiliser du HTML (balises, images, etc.)</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Résumé (optionnel)</label>
        <input
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL de l'image</label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="published"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">Publié</label>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : initialData ? "Mettre à jour" : "Créer"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/posts")}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-medium transition"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}