"use client";

import { addGuest } from "@/actions/guest-actions";
import { useRef, useState } from "react";

export default function GuestForm({ eventId }: { eventId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleAction(formData: FormData) {
    setLoading(true);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const title = formData.get("title") as string;
    await addGuest(eventId, firstName, lastName, title);
    formRef.current?.reset();
    setLoading(false);
  }

  return (
    <form ref={formRef} action={handleAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          name="title"
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <option value="">Titre</option>
          <option value="Mr">Mr</option>
          <option value="Mme">Mme</option>
          <option value="Dr">Dr</option>
          <option value="Papa">Papa</option>
          <option value="Maman">Maman</option>
          <option value="Excellence">Excellence</option>
          <option value="Professeur">Professeur</option>
          <option value="Docteur">Docteur</option>
        </select>
        <input
          name="firstName"
          placeholder="Prénom"
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          required
        />
        <input
          name="lastName"
          placeholder="Nom"
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl transition disabled:opacity-50"
      >
        {loading ? "Ajout en cours..." : "Ajouter l'invité"}
      </button>
    </form>
  );
}