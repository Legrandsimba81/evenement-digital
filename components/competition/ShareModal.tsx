"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Copy, Check, X } from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";

export default function ShareModal({ postSlug, title }: { postSlug: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const url = `${process.env.NEXT_PUBLIC_BASE_URL || "https://octaviaevent.com"}/concours/${postSlug}`;

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTo = (platform: string) => {
    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };
    window.open(shareUrls[platform], "_blank");
    setOpen(false);
  };

  return (
    <div className="relative inline-block" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition bg-gray-100 dark:bg-gray-800/80 px-4 py-2.5 rounded-xl cursor-pointer"
      >
        <Share2 size={18} /> Partager
      </button>

      {open && (
        <div className="fixed inset-x-4 bottom-4 sm:absolute sm:inset-auto sm:right-0 sm:bottom-full sm:mb-2 w-auto sm:w-80 max-w-sm rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Partager cet article</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => shareTo("whatsapp")}
              className="p-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer"
            >
              <SiWhatsapp size={16} /> WhatsApp
            </button>
            <button
              type="button"
              onClick={() => shareTo("facebook")}
              className="p-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer"
            >
              <SiFacebook size={16} /> Facebook
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              readOnly
              value={url}
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-600 dark:text-gray-300 outline-none truncate min-w-0"
            />
            <button
              type="button"
              onClick={copyLink}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition cursor-pointer shrink-0"
              title="Copier le lien"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}