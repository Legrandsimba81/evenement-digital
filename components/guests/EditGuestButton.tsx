"use client";

import { useState } from "react";
import { updateGuest } from "@/actions/guest-actions";

export default function EditGuestButton({ guest }: { guest: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(guest.title || "");
  const [firstName, setFirstName] = useState(guest.firstName);
  const [lastName, setLastName] = useState(guest.lastName);
  const [invitationType, setInvitationType] = useState(guest.invitationType || "single");
  const [guestLevel, setGuestLevel] = useState(guest.guestLevel || "STANDARD");
  const [customLevel, setCustomLevel] = useState("");
  const [phone, setPhone] = useState(guest.phone || "");
  const [email, setEmail] = useState(guest.email || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (value: string) => /^[a-zA-ZÀ-ÿ'\-]+$/.test(value);
  const validatePhone = (value: string) => /^0\d{9}$/.test(value);
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!validateField(firstName)) {
      newErrors.firstName = "Prénom invalide (pas d'espaces).";
    }
    if (!validateField(lastName)) {
      newErrors.lastName = "Nom invalide (pas d'espaces).";
    }
    if (phone && !validatePhone(phone)) {
      newErrors.phone = "Le téléphone doit contenir 10 chiffres et commencer par 0.";
    }
    if (email && !validateEmail(email)) {
      newErrors.email = "Email invalide.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalLevel = guestLevel === "custom" ? customLevel.trim() : guestLevel;
    await updateGuest(guest.id, {
      title,
      firstName,
      lastName,
      invitationType,
      guestLevel: finalLevel,
      phone,
      email,
    });
    setIsEditing(false);
    setErrors({});
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
      >
        Modifier
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <div className="grid grid-cols-2 gap-2">
        <select
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
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

        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Prénom"
          className="p-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
        />
      </div>

      <input
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Nom"
        className="p-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          value={invitationType}
          onChange={(e) => setInvitationType(e.target.value)}
          className="p-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
        >
          <option value="single">1 personne</option>
          <option value="couple">2 personnes</option>
        </select>

        <select
          value={guestLevel}
          onChange={(e) => {
            setGuestLevel(e.target.value);
            if (e.target.value !== "custom") setCustomLevel("");
          }}
          className="p-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
        >
          <option value="STANDARD">Standard</option>
          <option value="VIP">VIP</option>
          <option value="SUPERVIP">Super VIP</option>
          <option value="custom">Personnalisé</option>
        </select>
      </div>

      {guestLevel === "custom" && (
        <input
          value={customLevel}
          onChange={(e) => setCustomLevel(e.target.value)}
          placeholder="Niveau perso"
          className="p-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
        />
      )}

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Téléphone (optionnel)"
        className="p-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
      />
      {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (optionnel)"
        type="email"
        className="p-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
      />
      {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

      {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
      {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}

      <div className="flex items-center gap-3 mt-1">
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
        >
          OK
        </button>
        <button
          onClick={() => {
            setIsEditing(false);
            setErrors({});
          }}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}