"use client";

import { useState } from "react";
import { Share2, Copy, Check, ChevronDown } from "lucide-react";

export default function ShareButtons({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/blog/${slug}` : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`, "_blank");
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-500 transition">
        <Share2 size={20} /> Partager
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 min-w-[160px] z-10">
          <button onClick={copyLink} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copié !" : "Copier le lien"}
          </button>
          <button onClick={shareWhatsApp} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm">
            <span className="text-green-500">📱</span> WhatsApp
          </button>
          <button onClick={shareFacebook} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm">
            <span className="text-blue-600">📘</span> Facebook
          </button>
        </div>
      )}
    </div>
  );
}