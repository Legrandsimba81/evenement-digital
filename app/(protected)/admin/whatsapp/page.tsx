// app/(protected)/admin/whatsapp/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminWhatsAppPage() {
  const { data: session } = useSession();
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/register", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Erreur" });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Erreur" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Configuration WhatsApp</h1>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Étape 1 : Enregistrer le numéro</h2>
        <button
          onClick={handleRegister}
          disabled={loading}
          className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition disabled:opacity-50"
        >
          {loading ? "En cours..." : "Enregistrer le numéro"}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Étape 2 : Envoyer un message test</h2>
        <form onSubmit={handleTest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Numéro destinataire (format international, ex: 243827733286)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="243827733286"
              className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Votre message..."
              className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Envoyer un message test"}
          </button>
        </form>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <h3 className="font-medium mb-2">Résultat :</h3>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}