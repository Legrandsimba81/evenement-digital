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
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (value: string) => /^[a-zA-ZÀ-ÿ'\-]+$/.test(value);
  const validatePhone = (value: string) => /^0\d{9}$/.test(value);
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!validateField(firstName)) {
      newErrors.firstName = "Le prénom ne doit contenir qu'un seul mot (pas d'espaces).";
    }
    if (!validateField(lastName)) {
      newErrors.lastName = "Le nom ne doit contenir qu'un seul mot (pas d'espaces).";
    }
    if (phone && !validatePhone(phone)) {
      newErrors.phone = "Le téléphone doit contenir 10 chiffres et commencer par 0 (ex: 0827733286).";
    }
    if (email && !validateEmail(email)) {
      newErrors.email = "Veuillez saisir une adresse email valide.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const finalLevel = guestLevel === "custom" ? customLevel.trim() : guestLevel;

    try {
      await addGuest(
        eventId,
        firstName,
        lastName,
        title || undefined,
        invitationType,
        finalLevel,
        phone || undefined,
        email || undefined
      );
      // Réinitialisation
      setTitle("");
      setFirstName("");
      setLastName("");
      setInvitationType("single");
      setGuestLevel("STANDARD");
      setCustomLevel("");
      setPhone("");
      setEmail("");
      setErrors({});
    } catch (error: any) {
      setErrors({ general: error.message || "Erreur lors de l'ajout." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
      {/* Erreur générale */}
      {errors.general && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
          {errors.general}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <select
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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

        <div>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Prénom *"
            className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Nom *"
            className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>

        <select
          value={invitationType}
          onChange={(e) => setInvitationType(e.target.value)}
          className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="single">1 personne</option>
          <option value="couple">2 personnes</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <select
          value={guestLevel}
          onChange={(e) => {
            setGuestLevel(e.target.value);
            if (e.target.value !== "custom") setCustomLevel("");
          }}
          className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
            placeholder="Niveau personnalisé"
            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        )}

        {/* <div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Téléphone (optionnel)"
            className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div> */}

        <div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email de l'invité pour l'envoie automatique"
            type="email"
            className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition disabled:opacity-50 font-medium"
      >
        {isSubmitting ? "Ajout en cours..." : "Ajouter l'invité"}
      </button>
    </form>
  );
}