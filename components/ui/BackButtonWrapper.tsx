"use client";

import { usePathname } from "next/navigation";
import BackButton from "./BackButton";

const HIDE_BACK_BUTTON_ON = ["/", "/login", "/register", "/invitation"];

export default function BackButtonWrapper() {
  const pathname = usePathname();
  if (HIDE_BACK_BUTTON_ON.some((path) => pathname.startsWith(path))) {
    return null;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <BackButton /> {/* ← sans showText, donc icône seule */}
    </div>
  );
}