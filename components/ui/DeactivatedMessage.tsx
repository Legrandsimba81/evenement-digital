"use client";

export default function DeactivatedMessage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-800">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
          Compte désactivé
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Vous n'êtes pas autorisé à créer ou accéder à des événements pour le moment.
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
          Si c'est une erreur, contactez le support.
        </p>
        <a
          href="https://wa.me/0827733286"
          target="_blank"
          className="inline-flex items-center gap-2 mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition"
        >
          <span className="text-xl">📱</span>
          Contacter le support WhatsApp
        </a>
      </div>
    </div>
  );
}