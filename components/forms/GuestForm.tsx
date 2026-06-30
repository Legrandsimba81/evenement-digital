"use client";

import { addGuest } from "@/actions/guest-actions";
import { useState } from "react";

export default function GuestForm({ eventId }: { eventId: string }) {
  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [invitationType, setInvitationType] = useState("single");
  const [errors, setErrors] = useState({ firstName: "", lastName: "" });

  const validateField = (value: string) => {
    // Autorise uniquement les lettres, accents, apostrophes et tirets (pour les noms composés comme "Jean-Pierre")
    // Mais interdit les espaces
    return /^[a-zA-ZÀ-ÿ'\-]+$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ firstName: "", lastName: "" });

    let hasError = false;
    if (!validateField(firstName)) {
      setErrors((prev) => ({ ...prev, firstName: "Le prénom ne doit contenir qu'un seul mot (pas d'espaces)." }));
      hasError = true;
    }
    if (!validateField(lastName)) {
      setErrors((prev) => ({ ...prev, lastName: "Le nom ne doit contenir qu'un seul mot (pas d'espaces)." }));
      hasError = true;
    }

    if (hasError) return;

    await addGuest(eventId, firstName, lastName, title, invitationType);
    setTitle("");
    setFirstName("");
    setLastName("");
    setInvitationType("single");
    setErrors({ firstName: "", lastName: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2">
      <select
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
      >
        <option value="">Sans titre</option>
        <option value="Mr">Mr</option>
        <option value="Mme">Mme</option>
        <option value="PDG">PDG</option>
        <option value="Ir">Ir</option>
        <option value="Dr">Dr</option>
        <option value="Papa">Papa</option>
        <option value="Maman">Maman</option>
        <option value="Hon.">Hon.</option>
        <option value="Son Excellence">Son Excellence</option>
      </select>

      <div className="flex flex-col">
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Prénom (Ex: Jean-Pierre)"
          className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          required
        />
        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
      </div>

      <div className="flex flex-col">
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Nom (Ex: Kasereka) "
          className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          required
        />
        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
      </div>

      <select
        value={invitationType}
        onChange={(e) => setInvitationType(e.target.value)}
        className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
      >
        <option value="single">1 personne</option>
        <option value="couple">2 personnes (couple)</option>
      </select>

      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        Ajouter
      </button>
    </form>
  );
}