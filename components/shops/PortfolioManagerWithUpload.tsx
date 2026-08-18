"use client";

import { useState, useTransition } from "react";
import { addPortfolioImage, removePortfolioImage } from "@/actions/shop-actions";
import { uploadImage } from "@/actions/upload-image";
import { Loader2, Plus, X, Upload } from "lucide-react";

type ImageItem = { url: string; orientation?: 'portrait' | 'paysage' };

export default function PortfolioManagerWithUpload({
  shopSlug,
  initialImages,
}: {
  shopSlug: string;
  initialImages: ImageItem[];
}) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [orientation, setOrientation] = useState<'portrait' | 'paysage'>('paysage');
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
        await addPortfolioImage(shopSlug, result.url, orientation);
        setImages((prev) => [...prev, { url: result.url, orientation }]);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
      // Réinitialiser l'input pour permettre de re-uploader le même fichier
      e.target.value = "";
    }
  };

  const handleRemove = async (url: string) => {
    startTransition(async () => {
      try {
        await removePortfolioImage(shopSlug, url);
        setImages((prev) => prev.filter((img) => img.url !== url));
      } catch (err: any) {
        setError(err.message || "Erreur lors de la suppression.");
      }
    });
  };

  return (
    <div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Choisir une image
          </label>
          <div className="flex gap-2">
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
          </div>
          {uploading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Upload en cours...
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">Images acceptées : JPEG, PNG, WebP (max 5 Mo)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Orientation
          </label>
          <select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value as 'portrait' | 'paysage')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="paysage">Paysage (16:9)</option>
            <option value="portrait">Portrait (3:4)</option>
          </select>
        </div>
      </div>

      {images.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Aucune image.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className={`relative group overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 ${
                img.orientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'
              }`}
            >
              <img src={img.url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                {img.orientation === 'portrait' ? 'Portrait' : 'Paysage'}
              </div>
              <button
                onClick={() => handleRemove(img.url)}
                disabled={isPending}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}