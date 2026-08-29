"use client";

import React, { useState } from "react";
import html2canvas from 'html2canvas-pro';

interface DownloadFairePartButtonProps {
  /** L'ID HTML du conteneur du faire-part à capturer */
  targetId: string;
  /** Le nom du fichier téléchargé (sans extension) */
  fileName?: string;
  className?: string;
}

export default function DownloadFairePartButton({
  targetId,
  fileName = "mon-faire-part",
  className = "",
}: DownloadFairePartButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    const element = document.getElementById(targetId);

    if (!element) {
      console.error(`Élément avec l'ID "${targetId}" introuvable.`);
      alert("Impossible de télécharger le faire-part. Élément introuvable.");
      return;
    }

    try {
      setIsGenerating(true);

      // Capture de l'élément avec une bonne résolution
      const canvas = await html2canvas(element, {
        scale: 2, // Améliore la qualité de l'image
        useCORS: true, // Autorise le chargement d'images externes/hébergées
        backgroundColor: null, // Conserve le fond d'origine ou la transparence
        logging: false,
      });

      // Conversion du canvas en URL d'image PNG
      const dataUrl = canvas.toDataURL("image/png");

      // Création d'un lien temporaire pour déclencher le téléchargement
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur lors du téléchargement du faire-part :", error);
      alert("Une erreur est survenue lors de la génération de l'image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white transition-all bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isGenerating ? (
        <>
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Génération en cours...</span>
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            ></path>
          </svg>
          <span>Télécharger le faire-part</span>
        </>
      )}
    </button>
  );
}