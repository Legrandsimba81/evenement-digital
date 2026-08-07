// components/PaymentForm.tsx
"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, CheckCircle, AlertCircle, Zap, CreditCard } from "lucide-react";
import PawaPayPaymentForm from "./PawaPayPaymentForm";
import { Plan } from "@/types";

interface PaymentFormProps {
  plan: Plan;
  onSuccess: (plan: Plan) => void;
}

// Opérateurs pour la RDC uniquement
const CONGO_OPERATORS = [
  { id: "airtel", name: "Airtel Money", logo: "📱" },
  { id: "orange", name: "Orange Money", logo: "📲" },
  { id: "vodacom", name: "Vodacom M-Pesa", logo: "📶" },
];

const MANUAL_DEPOSIT_NUMBERS = {
  airtel: "+243 992 598 826",
  orange: "+243 827 733 286",
  vodacom: "+243 828 123 456",
};

export default function PaymentForm({ plan, onSuccess }: PaymentFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [paymentMode, setPaymentMode] = useState<"manual" | "auto">("auto");
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [isManualSuccess, setIsManualSuccess] = useState(false);
  const [manualError, setManualError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [manualData, setManualData] = useState({
    fullName: session?.user?.name || "",
    phoneNumber: "",
    operator: "airtel",
  });
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setManualData({ ...manualData, [e.target.name]: e.target.value });
    setManualError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur d'upload");
    return data.secure_url;
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofImage) {
      setManualError("Veuillez ajouter une capture d'écran du dépôt.");
      return;
    }
    setIsManualLoading(true);
    setManualError("");

    try {
      const imageUrl = await uploadImage(proofImage);
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          operator: manualData.operator,
          phoneNumber: manualData.phoneNumber,
          countryCode: "CD",
          fullName: manualData.fullName,
          proofImage: imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de paiement");
      setIsManualSuccess(true);
      setTimeout(() => {
        if (plan.eventType) {
          router.push(`/dashboard/event/new/${plan.eventType}?payment=pending`);
        } else {
          router.push("/dashboard");
        }
        onSuccess(plan);
      }, 2000);
    } catch (err: any) {
      setManualError(err.message || "Une erreur est survenue.");
    } finally {
      setIsManualLoading(false);
    }
  };

  const getDepositNumber = () => {
    return MANUAL_DEPOSIT_NUMBERS[manualData.operator as keyof typeof MANUAL_DEPOSIT_NUMBERS] || "Numéro non disponible";
  };

  const handleAutoSuccess = (plan: Plan) => {
    onSuccess(plan);
  };

  return (
    <div className="space-y-6">
      <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          type="button"
          onClick={() => setPaymentMode("auto")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition ${
            paymentMode === "auto"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          <Zap size={18} /> Paiement automatique
        </button>
        <button
          type="button"
          onClick={() => setPaymentMode("manual")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition ${
            paymentMode === "manual"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          <CreditCard size={18} /> Paiement manuel
        </button>
      </div>

      {paymentMode === "auto" ? (
        <PawaPayPaymentForm plan={plan} onSuccess={handleAutoSuccess} />
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          {/* Contenu du formulaire manuel... (inchangé) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Montant à payer</label>
            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-2xl font-bold text-gray-900 dark:text-white">
              {plan.price} {plan.currency}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pour {plan.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet (titulaire du compte)</label>
            <input
              type="text"
              name="fullName"
              value={manualData.fullName}
              onChange={handleManualChange}
              required
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opérateur</label>
            <select
              name="operator"
              value={manualData.operator}
              onChange={handleManualChange}
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {CONGO_OPERATORS.map((op) => (
                <option key={op.id} value={op.id}>{op.logo} {op.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Votre numéro de téléphone</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="+243 82X XXX XXX"
              value={manualData.phoneNumber}
              onChange={handleManualChange}
              required
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Effectuez le dépôt vers le numéro suivant :</p>
            <p className="text-lg font-bold text-blue-800 dark:text-blue-200 mt-1">{getDepositNumber()}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{CONGO_OPERATORS.find(op => op.id === manualData.operator)?.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Capture d'écran du dépôt</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`mt-1 flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition ${
                proofPreview
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
              }`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              {proofPreview ? (
                <div className="w-full">
                  <img src={proofPreview} alt="Preuve" className="max-h-48 mx-auto rounded-lg" />
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2 text-center">Capture téléchargée</p>
                </div>
              ) : (
                <>
                  <Upload size={40} className="text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Cliquez pour ajouter une capture</p>
                  <p className="text-xs text-gray-400">PNG, JPG, JPEG (max 5MB)</p>
                </>
              )}
            </div>
          </div>

          {manualError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle size={18} /> {manualError}
            </div>
          )}

          <button
            type="submit"
            disabled={isManualLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isManualLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Envoi en cours...
              </>
            ) : (
              "Envoyer ma preuve de paiement"
            )}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">Votre paiement sera vérifié manuellement par notre équipe.</p>
        </form>
      )}
    </div>
  );
}