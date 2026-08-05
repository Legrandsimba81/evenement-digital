"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { updateBlogPost, getBlogPost } from "@/actions/blog-actions";
import BlogEditor from "@/components/editor/BlogEditor";
import ImageUpload from "@/components/ui/ImageUpload";
import ImageGalleryUpload from "@/components/ui/ImageGalleryUpload";
import { Loader2 } from "lucide-react";

export default function EditPostPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageOrientation, setImageOrientation] = useState<"landscape" | "portrait">("landscape");
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);

  const handleSave = async (nextPublished: boolean) => {
    if (!title.trim() || !content.trim()) {
      setError("Le titre et le contenu sont obligatoires.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
      await updateBlogPost(slug, {
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        imageOrientation,
        images: images.length > 0 ? images : undefined,
        tags: tagsArray,
        published: nextPublished,
      });
      router.push("/admin/posts");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const post = await getBlogPost(slug);
        if (!post) {
          setError("Article introuvable.");
          setLoading(false);
          return;
        }
        setTitle(post.title);
        setExcerpt(post.excerpt || "");
        setContent(post.content);
        setImageUrl(post.imageUrl || "");
        // ✅ Correction : validation de l'orientation
        setImageOrientation(
          post.imageOrientation === "portrait" ? "portrait" : "landscape"
        );
        setImages(post.images as string[] || []);
        setTags((post.tags as string[] || []).join(", "));
        setPublished(post.published);
        setLoading(false);
      } catch {
        setError("Erreur lors du chargement.");
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave(published);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error && !loading) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Modifier l'article</h1>
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
            Déjà publié / à publier
          </label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition disabled:opacity-50"
          >
            {saving && <Loader2 size={18} className="animate-spin" />}
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : null}
            Publier maintenant
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