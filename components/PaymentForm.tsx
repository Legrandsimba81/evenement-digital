"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface PaymentFormProps {
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  onSuccess: () => void;
}

export default function PaymentForm({ plan, onSuccess }: PaymentFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simuler un appel à l'API de paiement PawaPay
    try {
      // Ici, vous intégrerez l'API réelle de PawaPay
      // Exemple : const response = await fetch("/api/payment", { method: "POST", body: JSON.stringify({ planId: plan.id, ...formData }) });
      await new Promise((resolve) => setTimeout(resolve, 2000)); // simulation
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        // Rediriger vers le tableau de bord ou la page de succès
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      alert("Erreur de paiement. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Paiement réussi !</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Vous allez être redirigé vers votre tableau de bord.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Montant</label>
        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xl font-bold text-gray-900 dark:text-white">
          {plan.price} {plan.currency}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de carte (simulation)</label>
        <input
          type="text"
          name="cardNumber"
          placeholder="4111 1111 1111 1111"
          value={formData.cardNumber}
          onChange={handleChange}
          required
          className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date d'expiration</label>
          <input
            type="text"
            name="expiry"
            placeholder="MM/AA"
            value={formData.expiry}
            onChange={handleChange}
            required
            className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVV</label>
          <input
            type="text"
            name="cvv"
            placeholder="123"
            value={formData.cvv}
            onChange={handleChange}
            required
            className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Traitement en cours...
          </>
        ) : (
          "Payer maintenant"
        )}
      </button>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        Paiement sécurisé via PawaPay. Aucune carte bancaire enregistrée.
      </p>
    </form>
  );
}