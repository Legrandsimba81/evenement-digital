"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { verifyEmail } from "@/actions/email-verification";
import Link from "next/link";

export default function VerifyEmailPage() {
  const { token } = useParams() as { token: string };
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      const result = await verifyEmail(token);
      if (result.error) {
        setStatus("error");
        setMessage(result.error);
      } else {
        setStatus("success");
        setMessage("Email vérifié avec succès ! Vous pouvez maintenant vous connecter.");
        // Redirection vers la page de connexion après 3 secondes
        setTimeout(() => router.push("/"), 3000);
      }
    };
    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
        {status === "loading" && <p className="text-gray-600 dark:text-gray-300">Vérification en cours...</p>}
        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-green-600">{message}</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Redirection vers la page de connexion...
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Se connecter maintenant
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-red-600">{message}</h1>
            <p className="mt-4">
              <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
                Retour à l'accueil
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}