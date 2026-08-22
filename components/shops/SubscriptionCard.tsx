"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, Smartphone } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  popular: boolean;
};

const OPERATORS = [
  { value: "airtel", label: "Airtel Money" },
  { value: "orange", label: "Orange Money" },
  { value: "vodacom", label: "Vodacom M-Pesa" },
];

export default function SubscriptionCard({
  shopSlug,
  plan,
  isVerified,
}: {
  shopSlug: string;
  plan: Plan;
  isVerified: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [operator, setOperator] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !operator) {
      setError("Veuillez renseigner votre numéro de téléphone et l'opérateur.");
      return;
    }
    // Valider le numéro (10 chiffres commençant par 0)
    if (!/^0\d{9}$/.test(phoneNumber)) {
      setError("Numéro invalide (10 chiffres, commence par 0).");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payment/pawapay/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          operator,
          phoneNumber,
          shopSlug,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Rediriger vers la page de confirmation ou afficher un message
        router.push(`/dashboard/shops/${shopSlug}/subscription/confirmation?ref=${data.reference}`);
      } else {
        setError(data.error || "Erreur lors de l'initiation du paiement.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Abonnement actif</p>
        <button
          onClick={() => router.push(`/dashboard/shops/${shopSlug}/subscription/manage`)}
          className="mt-4 w-full py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Gérer l'abonnement
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-white dark:bg-gray-900 rounded-2xl border p-6 shadow-sm hover:shadow-md transition ${
        plan.popular
          ? "border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/20"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
          Recommandé
        </span>
      )}

      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {plan.currency} / {plan.period}
        </span>
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
            <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>

      {!showPaymentForm ? (
        <button
          onClick={() => setShowPaymentForm(true)}
          className="mt-6 w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium shadow-sm transition"
        >
          Choisir ce plan
        </button>
      ) : (
        <form onSubmit={handleSubscribe} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Opérateur</label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            >
              <option value="">Sélectionnez</option>
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Numéro de téléphone</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0827733286"
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
            <p className="text-xs text-gray-400 mt-0.5">10 chiffres, commence par 0</p>
          </div>
          {error && <div className="text-xs text-red-500">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
            {loading ? "Traitement..." : "Payer via Mobile Money"}
          </button>
          <button
            type="button"
            onClick={() => setShowPaymentForm(false)}
            className="w-full text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
          >
            Annuler
          </button>
        </form>
      )}
    </div>
  );
}