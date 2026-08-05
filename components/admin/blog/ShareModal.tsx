"use client";

import { useState } from "react";
import { Share2, Copy, Check, X } from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";

export default function ShareModal({ postSlug, title }: { postSlug: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || "https://evenement-digital.vercel.app"}/blog/${postSlug}`;

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
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">
        <Share2 size={20} /> Partager
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Partager</h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => shareTo("whatsapp")} className="flex-1 p-3 bg-[#25D366] text-white rounded-xl flex items-center justify-center gap-2">
                <SiWhatsapp size={20} /> WhatsApp
              </button>
              <button onClick={() => shareTo("facebook")} className="flex-1 p-3 bg-[#1877F2] text-white rounded-xl flex items-center justify-center gap-2">
                <SiFacebook size={20} /> Facebook
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input readOnly value={url} className="flex-1 px-4 py-2 border rounded-xl bg-gray-50 dark:bg-gray-800 text-sm" />
              <button onClick={copyLink} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition">
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}