"use client";

import { addGuest } from "@/actions/guest-actions";
import { useState } from "react";

export default function GuestForm({ eventId }: { eventId: string }) {
  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [invitationType, setInvitationType] = useState("single");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addGuest(eventId, firstName, lastName, title, invitationType);
    setTitle("");
    setFirstName("");
    setLastName("");
    setInvitationType("single");
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
      <input
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="Prénom"
        className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
        required
      />
      <input
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Nom"
        className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
        required
      />
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