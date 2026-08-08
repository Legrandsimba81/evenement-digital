"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { addPortfolioImages, removePortfolioImage } from "@/actions/shop-actions";
import { Loader2, Plus, X } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

export default function PortfolioPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [shopName, setShopName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await fetch(`/api/shops/${slug}`);
        const data = await res.json();
        setShopName(data.name);
        setImages(data.profile?.images || []);
      } catch {
        setError("Erreur de chargement");
      }
    };
    fetchShop();
  }, [slug]);

  const handleAddImages = async (url: string) => {
    if (!url) return;
    setLoading(true);
    try {
      const updated = await addPortfolioImages(slug, [url]);
      setImages(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    if (!confirm("Supprimer cette image ?")) return;
    setLoading(true);
    try {
      const updated = await removePortfolioImage(slug, imageUrl);
      setImages(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Portfolio - {shopName || slug}
        </h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
        >
          Retour
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>}

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ajouter des images</h2>
          <span className="text-sm text-gray-500">{images.length} image(s)</span>
        </div>
        <ImageUpload
          value=""
          onChange={handleAddImages}
          label="Télécharger une image (jpeg, png, webp)"
        />
      </div>

      <div className="mt-6">
        {images.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            Aucune image dans le portfolio.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img src={img} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemoveImage(img)}
                  disabled={loading}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}