"use client";

import { useState } from "react";
import { X, Smartphone, Send, Loader2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: { name?: string | null; email?: string | null };
}

export default function PaymentModal({ isOpen, onClose, onSuccess, user }: PaymentModalProps) {
  const [operator, setOperator] = useState<"AIRTEL" | "VODACOM">("AIRTEL");
  const [phone, setPhone] = useState("");
  const [simName, setSimName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !simName) {
      setError("Veuillez remplir le numéro et le nom sur la SIM.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/concours/payment-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operator,
          phone,
          simName,
          message,
          candidateName: user.name,
          candidateEmail: user.email,
        }),
      });

      if (!res.ok) throw new Error();

      onSuccess();
    } catch {
      setError("Erreur lors de l'envoi des informations. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Titre */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Coordonnées de paiement</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Paiement via Mobile Money DRC</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-3 rounded-xl border border-red-200 dark:border-red-800/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection Opérateur */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Opérateur Mobile Money
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOperator("AIRTEL")}
                className={`py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                  operator === "AIRTEL"
                    ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
                    : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                Airtel Money
              </button>
              <button
                type="button"
                onClick={() => setOperator("VODACOM")}
                className={`py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                  operator === "VODACOM"
                    ? "border-red-600 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
                    : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                Vodacom M-Pesa
              </button>
            </div>
          </div>

          {/* Numéro de téléphone */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Numéro de Réception (+243)
            </label>
            <input
              type="tel"
              required
              placeholder="ex: 0990000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nom sur la SIM */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nom enregistré sur la carte SIM
            </label>
            <input
              type="text"
              required
              placeholder="ex: Jean Dupont"
              value={simName}
              onChange={(e) => setSimName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message facultatif */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Message facultatif
            </label>
            <textarea
              rows={2}
              placeholder="Une note pour l'administration..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Valider et Continuer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}