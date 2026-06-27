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
}

export default function ImageUploadWithCrop({
  label,
  aspect,
  initialPreview,
  onImageChange,
  description,
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
    });
  }, []);

  const handleCropComplete = useCallback(async () => {
    if (!imageRef.current) return;
    setIsCropping(true);
    const cropData = crop as PixelCrop;
    const blob = await generateCroppedImage(imageRef.current, cropData);
    if (blob) {
      const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
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
    setIsCropping(false);
  }, [crop, generateCroppedImage, onImageChange]);

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageSrc(null);
    setShowCrop(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onImageChange(null, null);
  };

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
              <p className="text-xs text-gray-700 dark:text-gray-400">PNG, JPG, JPEG (max. 10MB)</p>
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
              {isCropping ? "Recadrage..." : "Valider le recadrage"}
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
            >
              Annuler
            </button>
          </div>
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
        </div>
      )}
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );
}