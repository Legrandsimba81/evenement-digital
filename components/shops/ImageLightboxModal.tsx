"use client";

import { useState } from "react";
import { Download, X, ArrowLeft } from "lucide-react";

interface ImageLightboxModalProps {
  images: Array<{ url: string } | string>;
  shopName: string;
}

export default function ImageLightboxModal({ images, shopName }: ImageLightboxModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Extrait l'extension ou utilise jpg par défaut
      const extension = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
      link.download = `${shopName.toLowerCase().replace(/\s+/g, "-")}-realisation.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      // Fallback au téléchargement direct par fenêtre si blob échoue
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <>
      {/* Grille Portfolio Masonry */}
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
        {images.map((img, idx) => {
          const url = typeof img === "string" ? img : img.url;
          return (
            <div
              key={idx}
              onClick={() => setSelectedImage(url)}
              className="break-inside-avoid mb-4 overflow-hidden rounded-2xl bg-white dark:bg-gray-800 hover:opacity-90 transition duration-200 cursor-pointer border border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <img
                src={url}
                alt={`Réalisation ${idx + 1}`}
                className="w-full h-auto object-contain block"
                loading="lazy"
              />
            </div>
          );
        })}
      </div>

      {/* Modal Lightbox Plein Écran */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Barre d'action supérieure */}
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto z-10">
            <button
              onClick={() => setSelectedImage(null)}
              className="inline-flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium transition backdrop-blur-sm"
            >
              <ArrowLeft size={18} /> Retour à la boutique
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(selectedImage)}
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-lg"
              >
                <Download size={18} /> Télécharger
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition"
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Image Agrandie */}
          <div className="flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={selectedImage}
              alt="Réalisation grand format"
              className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}