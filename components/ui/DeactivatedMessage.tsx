"use client";

import Link from "next/link";
import { Lock, DollarSign } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function DeactivatedMessage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-800">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Lock size={32} className="text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
          Compte désactivé
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Vous n'êtes pas autorisé à créer ou accéder à des événements pour le moment.
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
          Ce message s'affiche généralement si vous n'avez pas payé votre abonnement ou si votre compte a été désactivé.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/243827733286"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition text-sm font-medium"
          >
            <SiWhatsapp size={20} />
            Contacter le support
          </a>
          <Link
            href="/tarifs"
            className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl transition text-sm font-medium"
          >
            <DollarSign size={20} />
            Voir les tarifs d'Events
          </Link>
        </div>
      </div>
    </div>
  );
}