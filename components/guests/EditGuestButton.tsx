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
  const [errors, setErrors] = useState({ firstName: "", lastName: "" });

  const validateField = (value: string) => /^[a-zA-ZÀ-ÿ'\-]+$/.test(value);

  const handleSave = async () => {
    setErrors({ firstName: "", lastName: "" });
    let hasError = false;
    if (!validateField(firstName)) {
      setErrors((prev) => ({ ...prev, firstName: "Prénom invalide (pas d'espaces)" }));
      hasError = true;
    }
    if (!validateField(lastName)) {
      setErrors((prev) => ({ ...prev, lastName: "Nom invalide (pas d'espaces)" }));
      hasError = true;
    }
    if (hasError) return;

    const finalLevel = guestLevel === "custom" ? customLevel.trim() : guestLevel;
    await updateGuest(guest.id, { title, firstName, lastName, invitationType, guestLevel: finalLevel });
    setIsEditing(false);
    setErrors({ firstName: "", lastName: "" });
  };

  if (!isEditing) {
    return (
      <button onClick={() => setIsEditing(true)} className="text-blue-500 text-sm hover:underline">
        Modifier
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-1">
      <select
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700"
      >
        <option value="">Sans titre</option>
        <option value="Mr">Mr</option>
        <option value="Mme">Mme</option>
        <option value="PDG">PDG</option>
        <option value="Boss">Boss</option>
        <option value="Couple">Couple</option>
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
          className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700"
          placeholder="Prénom"
        />
        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
      </div>
      <div className="flex flex-col">
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700"
          placeholder="Nom"
        />
        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
      </div>
      <select
        value={invitationType}
        onChange={(e) => setInvitationType(e.target.value)}
        className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700"
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
        className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700"
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
          placeholder="Niveau perso"
          className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700"
        />
      )}

      <button onClick={handleSave} className="bg-green-500 text-white px-2 py-1 rounded text-sm">
        OK
      </button>
      <button onClick={() => setIsEditing(false)} className="text-gray-500 text-sm">
        Annuler
      </button>
    </div>
  );
}