"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

export default function GateScanPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const guestId = searchParams.get("g");
  const secret = searchParams.get("s");

  useEffect(() => {
    if (!guestId || !secret) {
      setStatus("error");
      setMessage("Lien invalide.");
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
        } else {
          setStatus("error");
          setMessage(data.message || "Échec de la validation.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Erreur réseau.");
      });
  }, [guestId, secret]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-800">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Validation en cours...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle size={64} className="text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-green-600 mt-4">Entrée validée !</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={64} className="text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-red-600 mt-4">Accès refusé</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
          </>
        )}
        <button
          onClick={() => router.push("/")}
          className="mt-6 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl transition"
        >
          Retour à l’accueil
        </button>
      </div>
    </div>
  );
}