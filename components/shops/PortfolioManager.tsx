"use client";

import { useState, useTransition } from "react";
import { addPortfolioImage, removePortfolioImage } from "@/actions/shop-actions";
import { Loader2, Plus, X } from "lucide-react";

export default function PortfolioManager({
  shopSlug,
  initialImages,
}: {
  shopSlug: string;
  initialImages: string[];
}) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!newImageUrl.trim()) return;
    startTransition(async () => {
      try {
        await addPortfolioImage(shopSlug, newImageUrl);
        setImages((prev) => [...prev, newImageUrl]);
        setNewImageUrl("");
        setError("");
      } catch (err: any) {
        setError(err.message || "Erreur lors de l'ajout.");
      }
    });
  };

  const handleRemove = async (url: string) => {
    startTransition(async () => {
      try {
        await removePortfolioImage(shopSlug, url);
        setImages((prev) => prev.filter((img) => img !== url));
      } catch (err: any) {
        setError(err.message || "Erreur lors de la suppression.");
      }
    });
  };

  return (
    <div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

      <div className="flex gap-2 mb-6">
        <input
          type="url"
          placeholder="URL de l'image"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
        <button
          onClick={handleAdd}
          disabled={isPending || !newImageUrl.trim()}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          Ajouter
        </button>
      </div>

      {images.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Aucune image.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => handleRemove(url)}
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