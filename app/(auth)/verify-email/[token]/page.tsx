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
        setMessage("Email vérifié avec succès !");
        setTimeout(() => router.push("/dashboard"), 3000);
      }
    };
    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === "loading" && <p>Vérification en cours...</p>}
        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-green-600">{message}</h1>
            <p className="mt-2">Redirection vers votre tableau de bord...</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-red-600"> {message}</h1>
            <p className="mt-4">
              <Link href="/profile" className="text-blue-600 hover:underline">
                Retour au profil
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}