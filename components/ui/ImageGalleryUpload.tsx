// components/ui/ImageGalleryUpload.tsx
"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";

interface ImageGalleryUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  maxImages?: number;
}

export default function ImageGalleryUpload({
  images,
  onChange,
  label = "Images secondaires",
  maxImages = 6,
}: ImageGalleryUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= maxImages) {
      alert(`Vous ne pouvez pas ajouter plus de ${maxImages} images.`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        onChange([...images, data.secure_url]);
      } else {
        alert("Erreur lors de l'upload.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} ({images.length}/{maxImages})
      </label>

      <div className="grid grid-cols-3 gap-3">
        {images.map((url, idx) => (
          <div key={idx} className="relative rounded-lg border overflow-hidden aspect-square">
            <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center cursor-pointer hover:border-blue-500 transition">
            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
              <Upload size={24} className="text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">{uploading ? "Upload..." : "Ajouter"}</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}