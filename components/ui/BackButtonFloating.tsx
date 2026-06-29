"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

const HIDE_ON_PATHS = ["/", "/dashboard", "/login", "/register"];

export default function BackButtonFloating() {
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Cacher sur les pages principales et sur les pages d'invitation publique
    const shouldHide = HIDE_ON_PATHS.some((path) => pathname === path) ||
                       pathname.startsWith("/invitation/");
    setIsVisible(!shouldHide);
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <button
      onClick={() => router.back()}
      className="fixed top-35 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary-500 shadow-lg hover:bg-primary-600 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
      aria-label="Retour"
      title="Retour"
    >
      <ArrowLeft size={22} />
    </button>
  );
}