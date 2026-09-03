"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { Download, RefreshCw, Save, User, Scan } from "lucide-react";

type Props = {
  event: {
    id: string;
    title: string;
    slug?: string;
    unlistedGuestsLimit: number | null;
    unlistedGuestsCount: number;
  };
  qrUrl: string;
  token: string;
};

export default function UnlistedQrClient({ event, qrUrl, token }: Props) {
  const [count, setCount] = useState(event.unlistedGuestsCount);
  const [limit, setLimit] = useState<number | null>(event.unlistedGuestsLimit);
  const [guestName, setGuestName] = useState(""); // État pour le nom facultatif de l'invité
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!confirm("Réinitialiser le compteur ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/reset-unlisted`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
      } else {
        alert("Erreur lors de la réinitialisation");
      }
    } catch (error) {
      alert("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const updateLimit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/update-limit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit }),
      });
      if (res.ok) {
        const data = await res.json();
        setLimit(data.limit);
        alert("Limite mise à jour");
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch (error) {
      alert("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-unlisted-${event.title}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const downloadPDF = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/generate-invitation-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, guestName }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invitation-${event.title}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Erreur de génération du PDF");
      }
    } catch (error) {
      alert("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">QR pour invités hors liste</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            Ce QR permet aux invités non répertoriés d’entrer. Le compteur s’incrémente à chaque scan.
          </p>
        </div>

        {/* Bouton pour ouvrir la page de scan dans le Dashboard */}
        <Link
          href={`/dashboard/${event.slug || event.id}/scan-unlisted?token=${token}`}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-emerald-500/20 whitespace-nowrap"
        >
          <Scan size={18} /> Ouvrir le scanner
        </Link>
      </div>

      {/* Limite et mise à jour */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="limit" className="font-semibold text-sm">Limite :</label>
            <input
              id="limit"
              type="number"
              min="0"
              value={limit === null ? "" : limit}
              onChange={(e) => setLimit(e.target.value === "" ? null : parseInt(e.target.value, 10))}
              className="w-24 px-2 py-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={updateLimit}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 disabled:opacity-50"
          >
            <Save size={16} /> Mettre à jour
          </button>
        </div>
      </div>

      {/* Champ facultatif pour le nom de l'invité */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border space-y-2">
        <label htmlFor="guestName" className="font-semibold text-sm flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <User size={16} /> Nom de l'invité sur le PDF (facultatif) :
        </label>
        <input
          id="guestName"
          type="text"
          placeholder="Ex: Jean Dupont (laisser vide si non spécifié)"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* QR & Téléchargements */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow flex flex-col items-center">
        <QRCodeCanvas id="qr-code" value={qrUrl} size={256} level="H" />
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          <button
            onClick={downloadQR}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium"
          >
            <Download size={18} /> Télécharger le QR
          </button>
          <button
            onClick={downloadPDF}
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            <Download size={18} /> Télécharger l'invitation PDF
          </button>
        </div>
      </div>

      {/* Compteur */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Entrées enregistrées :</span>
          <span className="text-2xl font-bold">
            {count} / {limit ?? "∞"}
          </span>
        </div>
        <button
          onClick={handleReset}
          disabled={loading}
          className="mt-3 text-sm text-red-500 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
        >
          <RefreshCw size={14} /> Réinitialiser le compteur
        </button>
      </div>

      <div className="text-sm text-gray-500">
        <p>Token : <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{token}</code></p>
      </div>
    </div>
  );
}