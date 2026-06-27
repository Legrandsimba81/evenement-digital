"use client";

import { useState } from "react";
import { updateGuest } from "@/actions/guest-actions";

export default function EditGuestButton({ guest }: { guest: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(guest.title || "");
  const [firstName, setFirstName] = useState(guest.firstName);
  const [lastName, setLastName] = useState(guest.lastName);
  const [invitationType, setInvitationType] = useState(guest.invitationType || "seul");

  const handleSave = async () => {
    await updateGuest(guest.id, { title, firstName, lastName, invitationType });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="text-blue-500 text-sm hover:underline"
      >
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
        <option value="Dr">Dr</option>
        <option value="Papa">Papa</option>
        <option value="Maman">Maman</option>
        <option value="Excellence">Excellence</option>
      </select>
      <input
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700"
      />
      <input
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700"
      />
      <select
        value={invitationType}
        onChange={(e) => setInvitationType(e.target.value)}
        className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700"
      >
        <option value="seul">1 personne</option>
        <option value="couple">2 personnes</option>
      </select>
      <button
        onClick={handleSave}
        className="bg-green-500 text-white px-2 py-1 rounded text-sm"
      >
        OK
      </button>
      <button
        onClick={() => setIsEditing(false)}
        className="text-gray-500 text-sm"
      >
        Annuler
      </button>
    </div>
  );
}