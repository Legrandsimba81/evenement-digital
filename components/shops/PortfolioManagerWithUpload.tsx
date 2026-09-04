"use client";

import { useState, useTransition } from "react";
import { addPortfolioImage, removePortfolioImage } from "@/actions/shop-actions";
import { uploadImage } from "@/actions/upload-image";
import { Loader2, X, UploadCloud, ImagePlus } from "lucide-react";

type ImageItem = { url: string } | string;

export default function PortfolioManagerWithUpload({
  shopSlug,
  initialImages,
}: {
  shopSlug: string;
  initialImages: ImageItem[];
}) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [pendingFiles, setPendingFiles] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Sélection de plusieurs fichiers en local
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPending = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPendingFiles((prev) => [...prev, ...newPending]);
    setError("");
    e.target.value = "";
  };

  // Annuler la sélection d'une image en attente
  const removePending = (index: number) => {
    setPendingFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Upload et publication groupée
  const handlePublish = async () => {
    if (pendingFiles.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const uploadedImages: ImageItem[] = [];

      for (const item of pendingFiles) {
        const formData = new FormData();
        formData.append("file", item.file);

        const result = await uploadImage(formData);
        if (result.url) {
          await addPortfolioImage(shopSlug, result.url);
          uploadedImages.push({ url: result.url });
        }
      }

      setImages((prev) => [...prev, ...uploadedImages]);
      setPendingFiles([]);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la publication des images.");
    } finally {
      setUploading(false);
    }
  };

  // Suppression d'une image déjà publiée
  const handleRemove = async (url: string) => {
    startTransition(async () => {
      try {
        await removePortfolioImage(shopSlug, url);
        setImages((prev) =>
          prev.filter((img) => (typeof img === "string" ? img !== url : img.url !== url))
        );
      } catch (err: any) {
        setError(err.message || "Erreur lors de la suppression.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">{error}</div>}

      {/* Zone d'action & Sélection de fichiers */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="relative flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition w-full sm:w-auto text-gray-700 dark:text-gray-300 font-medium text-sm">
            <ImagePlus size={18} className="text-primary-500 dark:text-primary-400" />
            <span>Sélectionner des images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {pendingFiles.length > 0 && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={uploading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50 shadow-sm"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Publication en cours...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  <span>Publier {pendingFiles.length} image(s)</span>
                </>
              )}
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400">Images acceptées : JPEG, PNG, WebP (max 5 Mo par fichier)</p>

        {/* Prévisualisation des images sélectionnées en attente de publication */}
        {pendingFiles.length > 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Images prêtes à être publiées ({pendingFiles.length})
            </h4>
            <div className="flex flex-wrap gap-3">
              {pendingFiles.map((item, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
                  <img src={item.preview} alt="Prévisualisation" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePending(idx)}
                    disabled={uploading}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs shadow-md hover:bg-red-600 transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grille des images déjà publiées */}
      {images.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Aucune image dans le portfolio.</p>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-[15px] max-w-[1200px] mx-auto">
          {images.map((img, index) => {
            const imageUrl = typeof img === "string" ? img : img.url;

            return (
              <div
                key={index}
                className="relative group break-inside-avoid mb-[15px] overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 shadow-sm"
              >
                <img
                  src={imageUrl}
                  alt={`Portfolio ${index + 1}`}
                  className="w-full h-auto object-contain block"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(imageUrl)}
                  disabled={isPending || uploading}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600 shadow-md z-10 disabled:opacity-50"
                  title="Supprimer l'image"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}