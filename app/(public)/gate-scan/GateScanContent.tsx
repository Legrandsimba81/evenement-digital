"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function GateScanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [guestName, setGuestName] = useState("");

  const guestId = searchParams.get("g");
  const secret = searchParams.get("s");

  useEffect(() => {
    if (!guestId || !secret) {
      setStatus("error");
      setMessage("Lien de validation invalide. Vérifiez que vous avez scanné le bon QR.");
      return;
    }

    fetch("/api/gate/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId, secret }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Entrée validée ! Bienvenue !");
          setGuestName(data.guestName || "");
        } else {
          setStatus("error");
          setMessage(data.message || "Échec de la validation.");
        }
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
        setMessage("Erreur réseau. Vérifiez votre connexion.");
      });
  }, [guestId, secret]);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500/5 to-secondary-500/5 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-800">

        {/* Loading */}
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto"></div>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">
              Validation en cours...
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Vérification des accès
            </p>
          </>
        )}

        {/* Succès */}
        {status === "success" && (
          <>
            <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-20 h-20 rounded-full flex items-center justify-center">
              <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-4">
              Entrée validée !
            </h2>
            {guestName && (
              <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                Bienvenue {guestName}
              </p>
            )}
            <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
              L'invité est maintenant marqué comme "Entré" dans la liste.
            </p>
          </>
        )}

        {/* Erreur */}
        {status === "error" && (
          <>
            <div className="mx-auto bg-red-100 dark:bg-red-900/30 w-20 h-20 rounded-full flex items-center justify-center">
              <XCircle size={48} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-4">
              Accès refusé
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
            {(message.includes("déjà") || message.includes("annulé")) && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2 justify-center">
                  <AlertCircle size={16} />
                  {message.includes("déjà") ? "Cet invité est déjà entré." : "Cet invité a annulé sa présence."}
                </p>
              </div>
            )}
            <button
              onClick={handleRetry}
              className="mt-6 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl transition"
            >
              Réessayer
            </button>
          </>
        )}

        {/* Bouton retour (toujours présent) */}
        <button
          onClick={() => router.push("/")}
          className="mt-6 inline-block text-primary-500 hover:text-primary-600 text-sm font-medium transition border border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-4 py-2 rounded-xl"
        >
          Retour à l'accueil
        </button>

        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
          {guestId && secret ? "Validation sécurisée" : "Lien invalide"}
        </p>
      </div>
    </div>
  );
}