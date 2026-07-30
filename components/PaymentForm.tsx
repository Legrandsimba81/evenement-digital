"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react";

interface PaymentFormProps {
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
    eventType?: string;
  };
  onSuccess: (plan: any) => void;
}

const countries = [
  { code: "CD", name: "République Démocratique du Congo", flag: "🇨🇩" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "UG", name: "Ouganda", flag: "🇺🇬" },
  { code: "TZ", name: "Tanzanie", flag: "🇹🇿" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼" },
  { code: "BI", name: "Burundi", flag: "🇧🇮" },
];

const operators = [
  { id: "mpesa", name: "M-Pesa", logo: "📱" },
  { id: "airtel", name: "Airtel Money", logo: "📲" },
];

// Numéros de dépôt (à remplacer par vos vrais numéros)
const depositNumbers = {
  mpesa: {
    CD: "+243 999 999 999",
    KE: "+254 700 000 000",
    UG: "+256 700 000 000",
    TZ: "+255 700 000 000",
    RW: "+250 700 000 000",
    BI: "+257 700 000 000",
  },
  airtel: {
    CD: "+243 888 888 888",
    KE: "+254 800 000 000",
    UG: "+256 800 000 000",
    TZ: "+255 800 000 000",
    RW: "+250 800 000 000",
    BI: "+257 800 000 000",
  },
};

export default function PaymentForm({ plan, onSuccess }: PaymentFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    countryCode: "CD",
    operator: "mpesa",
    phoneNumber: "",
  });

  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "simba_events"); // À configurer dans Cloudinary

    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Erreur d'upload");
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofImage) {
      setError("Veuillez ajouter une capture d'écran du dépôt.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Upload de l'image
      const imageUrl = await uploadImage(proofImage);

      // Envoi de la transaction
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: { ...plan, price: plan.price },
          operator: formData.operator,
          phoneNumber: formData.phoneNumber,
          countryCode: formData.countryCode,
          proofImage: imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de paiement");

      setIsSuccess(true);
      setTimeout(() => {
        // Rediriger vers la création d'événement avec un paramètre pour indiquer que le paiement est en attente
        if (plan.eventType) {
          router.push(`/dashboard/event/new/${plan.eventType}?payment=pending`);
        } else {
          router.push("/dashboard");
        }
        onSuccess(plan);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const getDepositNumber = () => {
    const operator = formData.operator as keyof typeof depositNumbers;
    const country = formData.countryCode as keyof typeof depositNumbers.mpesa;
    return depositNumbers[operator]?.[country] || "Numéro non disponible";
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Dépôt enregistré !</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Votre paiement est en attente de validation. Vous serez redirigé dans quelques instants.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Montant à payer</label>
        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-2xl font-bold text-gray-900 dark:text-white">
          {plan.price} {plan.currency}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Pour {plan.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pays</label>
          <select
            name="countryCode"
            value={formData.countryCode}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opérateur</label>
          <select
            name="operator"
            value={formData.operator}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {operators.map((op) => (
              <option key={op.id} value={op.id}>
                {op.logo} {op.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Numéro de téléphone (pour le dépôt)
        </label>
        <input
          type="tel"
          name="phoneNumber"
          placeholder="+243 XXX XXX XXX"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
          📲 Effectuez le dépôt vers le numéro suivant :
        </p>
        <p className="text-lg font-bold text-blue-800 dark:text-blue-200 mt-1">
          {getDepositNumber()}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          {operators.find(op => op.id === formData.operator)?.name} · {countries.find(c => c.code === formData.countryCode)?.name}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Capture d'écran du dépôt
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`mt-1 flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition ${
            proofPreview
              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
              : "border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          {proofPreview ? (
            <div className="w-full">
              <img src={proofPreview} alt="Preuve" className="max-h-48 mx-auto rounded-lg" />
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 text-center">✅ Capture téléchargée</p>
            </div>
          ) : (
            <>
              <Upload size={40} className="text-gray-400" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Cliquez pour ajouter une capture
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, JPEG (max 5MB)</p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Envoi en cours...
          </>
        ) : (
          "Envoyer ma preuve de paiement"
        )}
      </button>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        Votre paiement sera vérifié manuellement par notre équipe.
      </p>
    </form>
  );
}