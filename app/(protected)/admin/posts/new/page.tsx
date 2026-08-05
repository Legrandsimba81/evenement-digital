"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBlogPost } from "@/actions/blog-actions";
import BlogEditor from "@/components/editor/BlogEditor";
import ImageUpload from "@/components/ui/ImageUpload";
import ImageGalleryUpload from "@/components/ui/ImageGalleryUpload";
import { Loader2 } from "lucide-react";

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageOrientation, setImageOrientation] = useState<"landscape" | "portrait">("landscape");
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }
    if (!content.trim()) {
      setError("Le contenu est obligatoire.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
      await createBlogPost({
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        imageOrientation,
        images: images.length > 0 ? images : undefined,
        tags: tagsArray,
        published,
      });
      router.push("/admin/posts");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Nouvel article</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Extrait</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contenu *</label>
          <BlogEditor initialContent={content} onChange={setContent} />
        </div>

        <div>
          <ImageUpload value={imageUrl} onChange={setImageUrl} label="Image principale" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Orientation de l'image</label>
          <select
            value={imageOrientation}
            onChange={(e) => setImageOrientation(e.target.value as "landscape" | "portrait")}
            className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="landscape">Paysage</option>
            <option value="portrait">Portrait</option>
          </select>
        </div>

        <div>
          <ImageGalleryUpload images={images} onChange={setImages} label="Images secondaires" maxImages={6} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (séparés par des virgules)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="anniversaire, mariage, tendances"
            className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Publier immédiatement
          </label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition disabled:opacity-50"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/posts")}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-xl transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}