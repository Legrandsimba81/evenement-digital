"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GuestVerificationForm({ slug }: { slug: string }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Nettoyer les espaces avant et après
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    if (cleanFirstName && cleanLastName) {
      router.push(
        `/invitation/${slug}?firstName=${encodeURIComponent(cleanFirstName)}&lastName=${encodeURIComponent(cleanLastName)}`
      );
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
        Bienvenue
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
        Veuillez entrer votre prénom et nom pour accéder à l'invitation. <br/> Ex: Moise Kasereka
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          required
        />
        <input
          type="text"
          placeholder="Nom"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          required
        />
        <button
          type="submit"
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-3 rounded-xl transition"
        >
          Voir l'invitation
        </button>
      </form>
    </div>
  );
}