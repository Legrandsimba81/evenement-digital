"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GuestVerificationForm({ slug, token }: { slug: string; token?: string }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tokenInput, setTokenInput] = useState(token || "");
  const [mode, setMode] = useState<"name" | "token">(token ? "token" : "name");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "token" && tokenInput) {
      router.push(`/invitation/${slug}?token=${encodeURIComponent(tokenInput)}`);
    } else if (mode === "name" && firstName.trim() && lastName.trim()) {
      router.push(
        `/invitation/${slug}?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`
      );
    }
  };

  const switchMode = (newMode: "name" | "token") => {
    setMode(newMode);
    setFirstName("");
    setLastName("");
    setTokenInput("");
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
        Bienvenue
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
        {mode === "name" ? "Entrez votre prénom et nom" : "Entrez votre numéro d'invitation"}
      </p>

      <div className="flex rounded-full border border-gray-200 dark:border-gray-700 mb-4 overflow-hidden">
        <button
          type="button"
          onClick={() => switchMode("name")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition ${
            mode === "name"
              ? "bg-primary-500 text-white"
              : "bg-transparent text-gray-600 dark:text-gray-400"
          }`}
        >
          Par nom
        </button>
        <button
          type="button"
          onClick={() => switchMode("token")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition ${
            mode === "token"
              ? "bg-primary-500 text-white"
              : "bg-transparent text-gray-600 dark:text-gray-400"
          }`}
        >
          Par jeton
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "name" ? (
          <>
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
          </>
        ) : (
          <input
            type="text"
            placeholder="INV-001"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            required
          />
        )}
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