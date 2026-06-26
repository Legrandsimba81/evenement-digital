"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Home, ArrowLeft, Search, Sparkles } from "lucide-react";

export default function NotFound() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Illustration / Logo */}
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-primary-500/10 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-primary-500" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Page introuvable
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Oups ! La page que vous cherchez n'existe pas ou a été déplacée.
        </p>

        <div className="space-y-3">
          <Link
            href={session ? "/dashboard" : "/"}
            className="inline-flex items-center justify-center gap-2 w-full bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-xl transition"
          >
            <Home size={20} />
            {session ? "Retour au tableau de bord" : "Retour à l'accueil"}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 w-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium px-6 py-3 rounded-xl transition"
          >
            <ArrowLeft size={20} />
            Page précédente
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Search size={16} />
          <span>Besoin d'aide ?</span>
          <Link href="/" className="text-primary-500 hover:underline">
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  );
}