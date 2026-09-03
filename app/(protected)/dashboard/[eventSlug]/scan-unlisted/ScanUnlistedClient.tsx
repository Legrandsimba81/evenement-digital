"use client";

import { useState } from "react";
import Link from "next/link";
import { Scanner } from "@yudiel/react-qr-scanner";
import { CheckCircle2, AlertCircle, RefreshCw, Camera, ArrowLeft, Scan } from "lucide-react";

type Props = {
  eventId: string;
  initialToken?: string; // utilisé pour pré-remplir le champ token si présent (ex: depuis un lien)
};

export default function ScanUnlistedClient({ eventId, initialToken }: Props) {
  const [token, setToken] = useState<string>(initialToken || "");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [scannerEnabled, setScannerEnabled] = useState(true);

  // Enregistrement de l'entrée via l'API
  const incrementEntry = async (tokenToVerify: string) => {
    if (!tokenToVerify.trim()) {
      setStatus({ type: "error", message: "Le token est vide." });
      return;
    }

    if (loading) return;
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/events/${eventId}/increment-unlisted`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToVerify.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: "Entrée enregistrée avec succès !" });
        setCount(data.newCount);
        setScanResult(null);
        setToken(""); // vider le champ
        setScannerEnabled(true); // réactiver le scanner pour la prochaine entrée
      } else {
        setStatus({ type: "error", message: data.error || "Échec de la validation." });
        setScannerEnabled(true); // réactiver en cas d'erreur pour réessayer
      }
    } catch {
      setStatus({ type: "error", message: "Erreur réseau lors de la validation." });
      setScannerEnabled(true);
    } finally {
      setLoading(false);
    }
  };

  // Réception du QR Code scanné
  const handleScan = (detectedCodes: { rawValue: string }[]) => {
    if (loading || !detectedCodes || detectedCodes.length === 0) return;

    const rawValue = detectedCodes[0].rawValue;
    // Extraction du token s'il s'agit d'une URL
    let extractedToken = rawValue;
    try {
      const url = new URL(rawValue);
      const urlToken = url.searchParams.get("token");
      if (urlToken) extractedToken = urlToken;
    } catch {
      // Valeur brute conservée
    }

    // Mettre à jour le champ token et le résultat du scan
    setToken(extractedToken);
    setScanResult(rawValue);
    setStatus(null);
    setScannerEnabled(false); // pause le scanner après un scan
  };

  // Réinitialisation manuelle pour scanner un autre invité
  const resetScanner = () => {
    setScannerEnabled(true);
    setScanResult(null);
    setStatus(null);
    setToken("");
  };

  // Soumission manuelle du token
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    incrementEntry(token);
  };

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <div>
        <Link
          href={`/dashboard/${eventId}/unlisted-qr`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-800 px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft size={16} /> Retour aux invités
        </Link>
      </div>

      {/* Zone caméra */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <Camera size={18} /> Caméra de scan
          </div>
          {!scannerEnabled && (
            <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2.5 py-1 rounded-full font-medium">
              Scanner en pause
            </span>
          )}
        </div>

        <div className="relative overflow-hidden rounded-xl border max-w-md mx-auto aspect-square bg-black">
          {scannerEnabled ? (
            <Scanner
              onScan={handleScan}
              onError={(error) => console.log(error)}
              styles={{ container: { width: "100%", height: "100%" } }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gray-900/80 text-white space-y-4 backdrop-blur-sm">
              <Scan size={48} className="text-blue-400" />
              <p className="font-semibold text-lg">QR scanné !</p>
              <p className="text-sm text-gray-300 break-all">{scanResult}</p>
              <button
                onClick={resetScanner}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30"
              >
                <RefreshCw size={16} /> Scanner un autre QR
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Saisie manuelle et validation */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Token détecté</h3>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Token (ou scannez le QR)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
          />
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={16} /> Validation...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> Valider l'entrée
              </>
            )}
          </button>
        </form>
      </div>

      {/* Message de statut */}
      {status && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
            status.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
          }`}
        >
          <div className="flex items-start gap-3">
            {status.type === "success" ? (
              <CheckCircle2 size={22} className="shrink-0 text-emerald-500 mt-0.5" />
            ) : (
              <AlertCircle size={22} className="shrink-0 text-red-500 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-sm">{status.message}</p>
              {count !== null && (
                <p className="text-xs mt-1">
                  Total entrées enregistrées : <span className="font-bold">{count}</span>
                </p>
              )}
            </div>
          </div>
          {status.type === "success" && (
            <button
              onClick={resetScanner}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium shrink-0"
            >
              Scanner un autre
            </button>
          )}
        </div>
      )}
    </div>
  );
}