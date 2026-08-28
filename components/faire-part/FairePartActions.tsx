"use client";

import { useState } from "react";
import { Copy, Share2, Mail, Check, Send } from "lucide-react";

interface Props {
  fairePartUrl: string;
  title: string;
}

export default function FairePartActions({ fairePartUrl, title }: Props) {
  const [copied, setCopied] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(fairePartUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Voici notre faire-part pour "${title}" : ${fairePartUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/faire-part/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fairePartUrl, title }),
      });
      if (res.ok) {
        alert("Email envoyé avec succès !");
        setEmailModal(false);
        setEmail("");
      } else {
        alert("Erreur lors de l'envoi.");
      }
    } catch {
      alert("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Copier le lien */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition"
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        {copied ? "Copié !" : "Copier"}
      </button>

      {/* Partager sur WhatsApp */}
      <button
        onClick={handleWhatsApp}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium transition"
      >
        <Share2 size={14} /> WhatsApp
      </button>

      {/* Partager par Email */}
      <button
        onClick={() => setEmailModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-950/30 hover:bg-sky-100 text-sky-600 dark:text-sky-400 rounded-lg text-xs font-medium transition"
      >
        <Mail size={14} /> Email
      </button>

      {/* Modal Email simple */}
      {emailModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Envoyer par e-mail</h3>
            <form onSubmit={handleSendEmail} className="space-y-3">
              <input
                type="email"
                required
                placeholder="Adresse email du destinataire"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEmailModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1 px-4 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Send size={12} /> {loading ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}