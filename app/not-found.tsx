"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-9xl font-bold text-primary-500 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Page non trouvée
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Oups ! La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl transition"
          >
            <Home size={20} />
            Accueil
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl transition"
          >
            <ArrowLeft size={20} />
            Retour
          </button>
        </div>
      </div>
    </div>
  );
}