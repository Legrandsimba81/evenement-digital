"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCandidatePost, updateCandidatePost } from "@/actions/competition-actions";
import BlogEditor from "@/components/editor/BlogEditor";
import ImageGalleryUpload from "@/components/ui/ImageGalleryUpload";
import { Loader2, Send, Upload, X, BadgeCheck, Save } from "lucide-react";

interface InitialPostData {
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  imageUrl?: string | null;
  imageOrientation?: string | null;
  images?: string[];
  tags?: string[];
}

interface CandidatePostFormProps {
  authorName?: string;
  authorImage?: string;
  initialData?: InitialPostData; // Données d'origine pour le mode édition
}

export default function CandidatePostForm({ authorName, authorImage, initialData }: CandidatePostFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initialData?.title || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [imageOrientation, setImageOrientation] = useState<"landscape" | "portrait">(
    (initialData?.imageOrientation as "landscape" | "portrait") || "landscape"
  );
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [tags, setTags] = useState(initialData?.tags ? initialData.tags.join(", ") : "");

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.secure_url);
      } else {
        alert("Erreur lors du téléversement de l'image.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      setError("Le contenu de votre article est obligatoire.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        imageOrientation,
        images: images.length > 0 ? images : undefined,
        tags: tagsArray,
      };

      if (isEditing && initialData) {
        const result = await updateCandidatePost(initialData.slug, payload);
        if (result?.slug) {
          router.push(`/concours/preview/${result.slug}`);
        }
      } else {
        const result = await createCandidatePost(payload);
        if (result?.slug) {
          router.push(`/concours/preview/${result.slug}`);
        }
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'enregistrement.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Profil du Candidat */}
      {authorName && (
        <div className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/40 mb-6">
          <img
            src={authorImage && authorImage.trim() !== "" ? authorImage : "/default-avatar.png"}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
          />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {authorName}
            </span>
            <BadgeCheck size={18} className="fill-blue-500 stroke-white flex-shrink-0" />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Titre */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Titre de l'article *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: L'impact de l'intelligence artificielle sur l'éducation..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
      </div>

      {/* Extrait */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Brève description / Extrait
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          placeholder="Résumez votre article en quelques lignes..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
      </div>

      {/* Éditeur Tiptap avec support HTML/Markdown */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Contenu de l'article *
        </label>
        <BlogEditor initialContent={content} onChange={setContent} />
      </div>

      {/* Image de Couverture Principale */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
          Image de couverture principale
        </label>
        {imageUrl ? (
          <div className="relative w-full h-48 rounded-xl border overflow-hidden">
            <img src={imageUrl} alt="Couverture" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl h-36 cursor-pointer hover:border-blue-500 transition bg-gray-50 dark:bg-gray-800/50">
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
            <Upload size={28} className="text-gray-400 mb-1" />
            <span className="text-xs text-gray-500">
              {uploadingCover ? "Téléversement en cours..." : "Cliquez pour téléverser une image de couverture"}
            </span>
          </label>
        )}
      </div>

      {/* Orientation de l'image */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Orientation d'affichage de l'image de couverture
        </label>
        <select
          value={imageOrientation}
          onChange={(e) => setImageOrientation(e.target.value as "landscape" | "portrait")}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
        >
          <option value="landscape">Paysage (16:9)</option>
          <option value="portrait">Portrait (3:4)</option>
        </select>
      </div>

      {/* Galerie d'images secondaires */}
      <ImageGalleryUpload
        images={images}
        onChange={setImages}
        label="Images d'illustration secondaires"
        maxImages={4}
      />

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Mots-clés / Tags (séparés par des virgules)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="concours, redaction, technologie"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
      </div>

      {/* Bouton de soumission */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          type="submit"
          disabled={loading || uploadingCover}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {isEditing ? "Enregistrement..." : "Soumission en cours..."}
            </>
          ) : isEditing ? (
            <>
              <Save size={18} />
              Enregistrer les modifications
            </>
          ) : (
            <>
              <Send size={18} />
              Soumettre mon article au concours
            </>
          )}
        </button>
      </div>
    </form>
  );
}