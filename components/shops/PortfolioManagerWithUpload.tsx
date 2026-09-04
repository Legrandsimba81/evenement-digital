"use client";

import { useState, useTransition } from "react";
import { addPortfolioImage, removePortfolioImage } from "@/actions/shop-actions";
import { uploadImage } from "@/actions/upload-image";
import { Loader2, X } from "lucide-react";

type ImageItem = { url: string } | string;

export default function PortfolioManagerWithUpload({
  shopSlug,
  initialImages,
}: {
  shopSlug: string;
  initialImages: ImageItem[];
}) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadImage(formData);
      if (result.url) {
        await addPortfolioImage(shopSlug, result.url);
        setImages((prev) => [...prev, { url: result.url }]);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

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
    <div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Choisir une image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 dark:text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-primary-50 file:text-primary-700
            hover:file:bg-primary-100
            dark:file:bg-primary-900/30 dark:file:text-primary-300
            disabled:opacity-50"
        />
        {uploading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Upload en cours...
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">Images acceptées : JPEG, PNG, WebP (max 5 Mo)</p>
      </div>

      {images.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Aucune image.</p>
      ) : (
        /* Grille Portfolio Masonry identique à la configuration CSS */
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
                  onClick={() => handleRemove(imageUrl)}
                  disabled={isPending}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600 shadow-md z-10"
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