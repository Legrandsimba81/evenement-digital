"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, Wallet, Heart, Cake, PartyPopper, Globe } from "lucide-react";
import Link from "next/link";

const EVENT_TYPES = [
  { id: "UNIVERSAL", label: "Modèle Universel", icon: Globe, desc: "S'adapte à tout type d'événement" },
  { id: "MARRIAGE", label: "Mariage", icon: Heart, desc: "Inclus les noms du marié et de la mariée" },
  { id: "BIRTHDAY", label: "Anniversaire", icon: Cake, desc: "Pour la personne qui fête son anniversaire" },
  { id: "PARTY", label: "Fête / Soirée", icon: PartyPopper, desc: "Inclus le nom de l'hôte ou organisateur" },
];

export default function NewInvitationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [eventType, setEventType] = useState("UNIVERSAL");

  const [formData, setFormData] = useState({
    title: "",
    groomName: "",
    brideName: "",
    organizerName: "",
    announcementText: "",
    eventDate: "",
    eventTime: "",
    locationName: "",
    mapsUrl: "",
    invitationLink: "",
    rsvpDeadline: "",
    mobileMoneyName: "",
    mobileMoneyNumber: "",
    contactPhone: "",
    contactEmail: "",
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
        body: JSON.stringify({ ...formData, eventType }),
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Créer un Faire-part</h1>
            <p className="text-sm text-gray-500">Choisissez une catégorie et remplissez les informations.</p>
          </div>
        </div>

        {/* 1. SECTEUR DE SÉLECTION DU TYPE D'ÉVÉNEMENT */}
        <div className="mb-8">
          <label className="block text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Type d'événement *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EVENT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = eventType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setEventType(type.id)}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 shadow-sm"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  <Icon className={`mt-0.5 ${isSelected ? "text-amber-600" : "text-gray-400"}`} size={20} />
                  <div>
                    <p className="font-semibold text-sm">{type.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{type.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* CHAMP INDISPENSABLE: Titre */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Titre de l'événement *
            </label>
            <input
              type="text"
              required
              placeholder={
                eventType === "MARRIAGE"
                  ? "Ex: Mariage de Jean & Marie"
                  : eventType === "BIRTHDAY"
                  ? "Ex: Les 30 ans de Christian"
                  : "Ex: Soirée de Gala"
              }
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* 2. CHAMPS CONDITIONNELS SELON LE TYPE D'ÉVÉNEMENT */}
          {eventType === "MARRIAGE" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50/30 dark:bg-amber-950/10 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nom du Marié *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jean Mukendi"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  value={formData.groomName}
                  onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nom de la Mariée *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Marie Kabanga"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  value={formData.brideName}
                  onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                />
              </div>
            </div>
          )}

          {(eventType === "BIRTHDAY" || eventType === "PARTY") && (
            <div className="p-4 bg-amber-50/30 dark:bg-amber-950/10 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {eventType === "BIRTHDAY" ? "Nom de la personne à l'honneur *" : "Nom de l'hôte / Organisateur *"}
              </label>
              <input
                type="text"
                required
                placeholder={eventType === "BIRTHDAY" ? "Ex: David Kasongo" : "Ex: La Famille Tshilombo"}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.organizerName}
                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
              />
            </div>
          )}

          {/* CHAMP INDISPENSABLE: Texte d'annonce */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Texte de l'annonce / Invitation *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Ex: Nous avons la joie de vous inviter à célébrer cet événement avec nous..."
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
              value={formData.announcementText}
              onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
            />
          </div>

          {/* CHAMPS INDISPENSABLES: Date, Heure, Lieu */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date *</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Heure *</label>
              <input
                type="time"
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.eventTime}
                onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Lieu / Salle *</label>
              <input
                type="text"
                required
                placeholder="Ex: Salle Suzanne, Gombe"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              />
            </div>
          </div>

          {/* OPTIONS SUPPLEMANTAIRES (Optionnelles) */}
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
                placeholder="https://octaviaevent.com/e/mon-invitation"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.invitationLink}
                onChange={(e) => setFormData({ ...formData, invitationLink: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date limite réponse (RSVP)</label>
              <input
                type="date"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.rsvpDeadline}
                onChange={(e) => setFormData({ ...formData, rsvpDeadline: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">URL Image / Photo d'illustration</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
          </div>

          {/* CONTRIBUTION MOBILE MONEY (Optionnel) */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl space-y-3">
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Wallet size={16} /> Contribution / Cadeau (Mobile Money)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Titulaire du compte</label>
                <input
                  type="text"
                  placeholder="Ex: Marie Kabanga"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  value={formData.mobileMoneyName}
                  onChange={(e) => setFormData({ ...formData, mobileMoneyName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Numéro de téléphone</label>
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

          {/* CONTACTS & NOTES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Téléphone de contact</label>
              <input
                type="text"
                placeholder="Ex: +243 999 000 111"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Note Importante / Dress Code</label>
              <input
                type="text"
                placeholder="Ex: Dress Code: Tenue de soirée"
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
            {loading ? "Création en cours..." : "Créer le Faire-part"}
          </button>
        </form>
      </div>
    </div>
  );
}