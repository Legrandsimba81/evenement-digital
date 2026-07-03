"use client";

import { addGuest } from "@/actions/guest-actions";
import { useState } from "react";

export default function GuestForm({ eventId }: { eventId: string }) {
  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [invitationType, setInvitationType] = useState("single");
  const [guestLevel, setGuestLevel] = useState("STANDARD");
  const [customLevel, setCustomLevel] = useState("");
  const [errors, setErrors] = useState({ firstName: "", lastName: "" });

  const validateField = (value: string) => /^[a-zA-ZÀ-ÿ'\-]+$/.test(value);

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

    const finalLevel = guestLevel === "custom" ? customLevel.trim() : guestLevel;
    await addGuest(eventId, firstName, lastName, title, invitationType, finalLevel);
    setTitle("");
    setFirstName("");
    setLastName("");
    setInvitationType("single");
    setGuestLevel("STANDARD");
    setCustomLevel("");
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
        <option value="Couple">Couple</option>
        <option value="Papa">Papa</option>
        <option value="Maman">Maman</option>
        <option value="Ir">Ir</option>
        <option value="Dr">Dr</option>
        <option value="Président">Président</option>
        <option value="PDG">PDG</option>
        <option value="Boss">Boss</option>
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
          placeholder="Nom (Ex: Kasereka)"
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

      {/* Niveau */}
      <div className="flex flex-col gap-1">
        <select
          value={guestLevel}
          onChange={(e) => {
            setGuestLevel(e.target.value);
            if (e.target.value !== "custom") setCustomLevel("");
          }}
          className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="STANDARD">Standard</option>
          <option value="VIP">VIP</option>
          <option value="SUPERVIP">Super VIP</option>
          <option value="custom">Personnalisé</option>
        </select>
        {guestLevel === "custom" && (
          <input
            value={customLevel}
            onChange={(e) => setCustomLevel(e.target.value)}
            placeholder="Ex: Or, Platine, Premium..."
            className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          />
        )}
      </div>

      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        Ajouter
      </button>
    </form>
  );
}