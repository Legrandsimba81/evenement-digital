"use client";

import { useState, useRef, useCallback } from "react";
import { ImageIcon, X } from "lucide-react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageUploadWithCropProps {
  label: string;
  aspect: number;
  initialPreview?: string | null;
  onImageChange: (file: File | null, preview: string | null) => void;
  description?: string;
  maxSizeMB?: number; // Taille max souhaitée
}

export default function ImageUploadWithCrop({
  label,
  aspect,
  initialPreview,
  onImageChange,
  description,
  maxSizeMB = 1.5, // Taille max par défaut : 1.5 Mo
}: ImageUploadWithCropProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(initialPreview || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 80,
    height: aspect === 4/3 ? 75 : 60,
    x: 10,
    y: 10,
  });
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalSize(file.size);
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowCrop(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCroppedImage = useCallback(async (image: HTMLImageElement, crop: PixelCrop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
    });
  }, []);

  // ✅ Compression de l'image pour réduire la taille
  const compressImage = async (blob: Blob): Promise<Blob> => {
    const MAX_SIZE_MB = maxSizeMB; // Taille max en Mo
    const maxBytes = MAX_SIZE_MB * 1024 * 1024;

    if (blob.size <= maxBytes) {
      return blob; // Pas besoin de compresser
    }

    console.log(`📦 Compression de l'image : ${(blob.size / 1024 / 1024).toFixed(2)} Mo → target ${MAX_SIZE_MB} Mo`);

    // Créer un canvas pour redimensionner
    const img = new Image();
    const imageUrl = URL.createObjectURL(blob);
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = imageUrl;
    });

    // Calculer les nouvelles dimensions pour réduire la taille
    const MAX_WIDTH = 1200;
    const MAX_HEIGHT = 1200;
    let width = img.width;
    let height = img.height;
    if (width > height) {
      if (width > MAX_WIDTH) {
        height = (height * MAX_WIDTH) / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width = (width * MAX_HEIGHT) / height;
        height = MAX_HEIGHT;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(img, 0, 0, width, height);

    // Compresser avec une qualité progressive
    let quality = 0.85;
    let compressedBlob: Blob | null = null;
    let attempts = 0;
    while (!compressedBlob || (compressedBlob.size > maxBytes && quality > 0.3 && attempts < 5)) {
      compressedBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
      });
      quality -= 0.1;
      attempts++;
    }

    URL.revokeObjectURL(imageUrl);

    const finalBlob = compressedBlob || blob;
    console.log(`✅ Compression terminée : ${(finalBlob.size / 1024 / 1024).toFixed(2)} Mo (qualité finale: ${quality + 0.1})`);
    return finalBlob;
  };

  const handleCropComplete = useCallback(async () => {
    if (!imageRef.current) return;
    setIsCropping(true);
    try {
      const cropData = crop as PixelCrop;
      const blob = await generateCroppedImage(imageRef.current, cropData);
      if (blob) {
        // ✅ Compresser l'image après le crop
        const compressedBlob = await compressImage(blob);
        const file = new File([compressedBlob], "cropped-image.jpg", { type: "image/jpeg" });
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => {
          const preview = reader.result as string;
          setImagePreview(preview);
          setImageSrc(null);
          setShowCrop(false);
          onImageChange(file, preview);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("❌ Erreur lors du recadrage/compression:", error);
      alert("Erreur lors du traitement de l'image. Réessayez.");
    }
    setIsCropping(false);
  }, [crop, generateCroppedImage, compressImage, onImageChange]);

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageSrc(null);
    setShowCrop(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onImageChange(null, null);
    setOriginalSize(0);
  };

  const fileSizeDisplay = originalSize > 0 ? `(${(originalSize / 1024 / 1024).toFixed(2)} Mo)` : "";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {!showCrop && !imagePreview ? (
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-400 rounded-xl cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-10 h-10 text-gray-700 dark:text-gray-400" />
              <p className="mb-2 text-sm text-gray-700 dark:text-gray-400">
                <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-400">
                PNG, JPG, JPEG (max. 10MB, compressé automatiquement)
              </p>
              {originalSize > 0 && (
                <p className="text-xs text-gray-500 mt-1">Taille originale : {fileSizeDisplay}</p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </label>
        </div>
      ) : showCrop && imageSrc ? (
        <div className="relative">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            aspect={aspect}
            className="max-h-96"
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Recadrage"
              className="w-full h-auto rounded-xl"
            />
          </ReactCrop>
          <div className="flex gap-2 mt-2 flex-wrap">
            <button
              type="button"
              onClick={handleCropComplete}
              disabled={isCropping}
              className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition disabled:opacity-50"
            >
              {isCropping ? "Traitement..." : "Valider le recadrage"}
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
            >
              Annuler
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ⚡ L'image sera compressée automatiquement après validation.
          </p>
        </div>
      ) : imagePreview && (
        <div className="relative mt-4 inline-block">
          <img
            src={imagePreview}
            alt="Aperçu"
            className="h-48 w-auto object-cover rounded-xl border-2 border-gray-400 dark:border-gray-600"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
          >
            <X size={16} />
          </button>
          {imageFile && (
            <p className="text-xs text-gray-500 mt-1">
              Taille : {(imageFile.size / 1024 / 1024).toFixed(2)} Mo
            </p>
          )}
        </div>
      )}
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );
}