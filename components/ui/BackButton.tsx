"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
  showText?: boolean;
  label?: string;
}

export default function BackButton({ 
  className = "", 
  showText = false, 
  label = "Retour" 
}: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors ${className}`}
      aria-label="Retour"
    >
      <ArrowLeft size={18} />
      {showText && <span>{label}</span>}
    </button>
  );
}