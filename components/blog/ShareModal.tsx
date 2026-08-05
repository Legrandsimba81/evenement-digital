"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Copy, Check, X } from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";

export default function ShareModal({ postSlug, title }: { postSlug: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || "https://evenement-digital.vercel.app"}/blog/${postSlug}`;

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
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
      >
        <Share2 size={20} /> Partager
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Partager</h3>
            <button type="button" onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={16} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            <button type="button" onClick={() => shareTo("whatsapp")} className="p-3 bg-[#25D366] text-white rounded-xl flex items-center justify-center gap-2 text-sm">
              <SiWhatsapp size={18} /> WhatsApp
            </button>
            <button type="button" onClick={() => shareTo("facebook")} className="p-3 bg-[#1877F2] text-white rounded-xl flex items-center justify-center gap-2 text-sm">
              <SiFacebook size={18} /> Facebook
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input readOnly value={url} className="flex-1 px-3 py-2 border rounded-xl bg-gray-50 dark:bg-gray-800 text-xs" />
            <button type="button" onClick={copyLink} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}