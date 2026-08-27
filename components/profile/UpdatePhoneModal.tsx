"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";

interface UpdatePhoneModalProps {
  initialPhone: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UpdatePhoneModal({ initialPhone, isOpen, onClose }: UpdatePhoneModalProps) {
  const router = useRouter();
  const [phone, setPhone] = useState(initialPhone);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/update-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Numéro de téléphone mis à jour !");
        onClose();
        router.refresh();
      } else {
        alert(data.error || "Erreur lors de la mise à jour.");
      }
    } catch {
      alert("Erreur réseau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialPhone ? "Modifier" : "Ajouter"} mon numéro de téléphone
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleUpdatePhone} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0 XXX XXX XXX"
              required
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}