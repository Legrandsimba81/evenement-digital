"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import type { Plan } from "@/types";

interface PawaPayPaymentFormProps {
  plan: Plan;
  onSuccess: (plan: Plan) => void;
}

const operators = [
  { id: "airtel", name: "Airtel Money", code: "+243" },
  { id: "orange", name: "Orange Money", code: "+243" },
  { id: "vodacom", name: "Vodacom M-Pesa", code: "+243" },
];

export default function PawaPayPaymentForm({ plan, onSuccess }: PawaPayPaymentFormProps) {
  const router = useRouter();
  const [operator, setOperator] = useState("airtel");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 9) {
      setError("Veuillez saisir un numéro de téléphone valide (9 chiffres).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fullPhone = `+243${phoneNumber.replace(/\s/g, "")}`;
      const res = await fetch("/api/payment/pawapay/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          operator,
          phoneNumber: fullPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de paiement");

      setPaymentReference(data.reference);
      setSuccess(true);
      // Rediriger après 2 secondes
      setTimeout(() => {
        onSuccess(plan);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Paiement en cours</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Un code de confirmation a été envoyé sur votre téléphone.
          <br />
          Veuillez confirmer le paiement sur votre appareil.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Référence : {paymentReference}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Montant</label>
        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-2xl font-bold text-gray-900 dark:text-white">
          {plan.price} {plan.currency}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pour {plan.name}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opérateur</label>
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          {operators.map((op) => (
            <option key={op.id} value={op.id}>{op.name} ({op.code})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de téléphone</label>
        <div className="flex items-center gap-1">
          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-l-xl text-gray-700 dark:text-gray-300">+243</span>
          <input
            type="tel"
            placeholder="99 999 9999"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
            className="flex-1 px-4 py-2 rounded-r-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ex: 828 123 456</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Initiation en cours...
          </>
        ) : (
          `Payer ${plan.price} ${plan.currency}`
        )}
      </button>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        Paiement sécurisé via PawaPay. Vous recevrez un code de confirmation.
      </p>
    </form>
  );
}