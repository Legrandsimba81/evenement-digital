"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButtonFloating() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="fixed top-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
      aria-label="Retour"
      title="Retour"
    >
      <ArrowLeft size={22} />
    </button>
  );
}