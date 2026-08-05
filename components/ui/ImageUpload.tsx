"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "Image principale" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        onChange(data.secure_url);
      } else {
        alert("Erreur lors de l'upload.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => onChange("");

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Aperçu" className="max-h-48 rounded-lg border" />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <label className="cursor-pointer rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-blue-500 dark:border-gray-700 dark:text-gray-300">
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            <span className="flex items-center gap-2">
              <Upload size={18} />
              {uploading ? "Upload..." : "Choisir une image"}
            </span>
          </label>
          <span className="text-xs text-gray-400">PNG, JPG, WEBP (max 5 Mo)</span>
        </div>
      )}
    </div>
  );
}