"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";

export default function NewInvitationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    coupleNames: "",
    invitationText: "",
    date: "",
    time: "",
    location: "",
    mapsUrl: "",
    invitationUrl: "",
    rsvpDeadline: "",
    mobileMoneyName: "",
    mobileMoneyNumber: "",
    contacts: "",
    importantNote: "",
    imageUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        alert("Erreur lors de la création du faire-part");
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft size={16} /> Retour au tableau de bord
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Créer un Faire-part PDF</h1>
            <p className="text-sm text-gray-500">Remplissez les informations pour générer le faire-part PDF.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Titre de l'événement *</label>
              <input
                type="text"
                required
                placeholder="Ex: Mariage Princier"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Identité des Mariés *</label>
              <input
                type="text"
                required
                placeholder="Ex: Jean & Marie"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.coupleNames}
                onChange={(e) => setFormData({ ...formData, coupleNames: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Texte du Faire-part *</label>
            <textarea
              required
              rows={3}
              placeholder="Ex: Nous avons le grand plaisir de vous convier à notre mariage..."
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
              value={formData.invitationText}
              onChange={(e) => setFormData({ ...formData, invitationText: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date *</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Heure *</label>
              <input
                type="time"
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Lieu *</label>
              <input
                type="text"
                required
                placeholder="Ex: Cathédrale de Kinshasa"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Lien Google Maps (Optionnel)</label>
              <input
                type="url"
                placeholder="https://maps.google.com/..."
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.mapsUrl}
                onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Lien Invitation Web (Optionnel)</label>
              <input
                type="url"
                placeholder="https://octaviaevent.com/e/mon-mariage"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.invitationUrl}
                onChange={(e) => setFormData({ ...formData, invitationUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date limite réponse (Optionnel)</label>
              <input
                type="date"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.rsvpDeadline}
                onChange={(e) => setFormData({ ...formData, rsvpDeadline: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">URL Image Principale</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl space-y-3">
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Wallet size={16} /> Contribution Mobile Money
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Nom titulaire SIM</label>
                <input
                  type="text"
                  placeholder="Ex: Marie Kabanga (M-Pesa)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  value={formData.mobileMoneyName}
                  onChange={(e) => setFormData({ ...formData, mobileMoneyName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Numéro Mobile Money</label>
                <input
                  type="text"
                  placeholder="Ex: +243 81 000 0000"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  value={formData.mobileMoneyNumber}
                  onChange={(e) => setFormData({ ...formData, mobileMoneyNumber: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Contacts</label>
              <input
                type="text"
                placeholder="Ex: +243 999 000 111"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.contacts}
                onChange={(e) => setFormData({ ...formData, contacts: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Note Importante</label>
              <input
                type="text"
                placeholder="Ex: Dress Code: Blanc & Or"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.importantNote}
                onChange={(e) => setFormData({ ...formData, importantNote: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold rounded-xl transition shadow-lg"
          >
            {loading ? "Création en cours..." : "Créer et Générer le Faire-part"}
          </button>
        </form>
      </div>
    </div>
  );
}