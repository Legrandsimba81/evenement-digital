"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminWhatsAppPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [templateName, setTemplateName] = useState("hello_world"); // Template par défaut Meta
  const [sendMode, setSendMode] = useState<"template" | "text">("template");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // CORRECTION : Protection de route propre en composant client
  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "ADMIN")) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div className="p-6 text-center">Chargement de la session...</div>;
  }

  const handleRegister = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/whatsapp/register", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Erreur réseau" });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      // Préparation du payload selon le mode choisi
      const payload = sendMode === "template" 
        ? { to: phone, templateName } 
        : { to: phone, message };

      const res = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Erreur réseau" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Configuration WhatsApp Business API</h1>

      {/* Étape 1 : Activation technique du numéro */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Étape 1 : Forcer l'activation du numéro</h2>
        <p className="text-sm text-gray-500 mb-4">
          Cliquez ici pour envoyer la requête d'enregistrement. Cela fera passer votre numéro du statut "En attente" à "Connecté" dans Meta.
        </p>
        <button
          onClick={handleRegister}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer le numéro via l'API"}
        </button>
      </div>

      {/* Étape 2 : Test d'envoi de messages */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Étape 2 : Envoyer un message de test</h2>
        <form onSubmit={handleTest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Numéro destinataire (format international, ex: 243XXXXXXXXX)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="243827733286"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Sélecteur de méthode exigé par les règles Meta */}
          <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button
              type="button"
              onClick={() => setSendMode("template")}
              className={`py-2 text-sm font-medium rounded-lg transition ${sendMode === "template" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-white" : "text-gray-500"}`}
            >
              Mode Template (Nouveau Client / Initialisation)
            </button>
            <button
              type="button"
              onClick={() => setSendMode("text")}
              className={`py-2 text-sm font-medium rounded-lg transition ${sendMode === "text" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-white" : "text-gray-500"}`}
            >
              Mode Texte Libre (Session ouverte &lt; 24h)
            </button>
          </div>

          {sendMode === "template" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom du Template Meta
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="hello_world"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 outline-none focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Utilisez le modèle de test par défaut fourni par Meta nommé "hello_world".
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contenu du message texte
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Votre message personnalisé..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 outline-none focus:border-blue-500"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Envoyer le test"}
          </button>
        </form>
      </div>

      {/* Zone de logs et résultats */}
      {result && (
        <div className={`mt-6 p-4 rounded-xl border ${result.success ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"}`}>
          <h3 className={`font-semibold mb-2 ${result.success ? "text-green-800 dark:text-green-400" : "text-red-800 dark:text-red-400"}`}>
            {result.success ? "✓ Opération réussie" : "✗ Une erreur est survenue"}
          </h3>
          <pre className="text-xs overflow-auto font-mono whitespace-pre-wrap max-h-60 bg-white/50 dark:bg-black/20 p-3 rounded-lg text-gray-800 dark:text-gray-200">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
