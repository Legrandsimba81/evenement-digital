"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, Clock, MapPin, Image as ImageIcon, User, Heart, 
  CreditCard, Phone, Mail, AlertTriangle, Loader2
} from "lucide-react";

export default function CreateFairePartForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    groomName: "",
    brideName: "",
    announcementText: "",
    eventDate: "",
    eventTime: "",
    locationName: "",
    mapsUrl: "",
    invitationLink: "",
    rsvpDeadline: "",
    mobileMoneyNumber: "",
    mobileMoneyName: "",
    contactPhone: "",
    contactEmail: "",
    importantNote: "",
    imageUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/faire-part", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création.");

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* Titre & Visuel */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          Informations générales
        </h3>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Titre du Faire-Part *
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="Ex: Mariage Marc & Sophie"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL de l'Image principale (Optionnel)
          </label>
          <div className="relative">
            <ImageIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="url"
              name="imageUrl"
              placeholder="https://exemple.com/image.jpg"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Identité des mariés */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          Identité des mariés
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom du Marié *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                name="groomName"
                required
                placeholder="Ex: Marc Dubois"
                value={formData.groomName}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom de la Mariée *
            </label>
            <div className="relative">
              <Heart className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                name="brideName"
                required
                placeholder="Ex: Sophie Laurent"
                value={formData.brideName}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Texte d'annonce / Invitation *
          </label>
          <textarea
            name="announcementText"
            required
            rows={4}
            placeholder="Ex: Nous avons le plaisir de vous inviter à célébrer notre union..."
            value={formData.announcementText}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Date, Heure & Lieu */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          Date & Lieu
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date de l'événement *
            </label>
            <input
              type="date"
              name="eventDate"
              required
              value={formData.eventDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Heure *
            </label>
            <input
              type="text"
              name="eventTime"
              required
              placeholder="Ex: 15h30"
              value={formData.eventTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lieu de l'événement *
          </label>
          <input
            type="text"
            name="locationName"
            required
            placeholder="Ex: Cathédrale Notre-Dame, Kinshasa"
            value={formData.locationName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lien Google Maps (Optionnel)
          </label>
          <input
            type="url"
            name="mapsUrl"
            placeholder="https://maps.google.com/..."
            value={formData.mapsUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Confirmation & Mobile Money */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          Options de réponse & Mobile Money
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date limite de réponse (RSVP)
            </label>
            <input
              type="date"
              name="rsvpDeadline"
              value={formData.rsvpDeadline}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lien d'invitation / Formulaire externe
            </label>
            <input
              type="url"
              name="invitationLink"
              placeholder="https://..."
              value={formData.invitationLink}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Numéro Mobile Money (SIM)
            </label>
            <input
              type="text"
              name="mobileMoneyNumber"
              placeholder="Ex: +243 810 000 000"
              value={formData.mobileMoneyNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom sur le compte SIM (Mobile Money)
            </label>
            <input
              type="text"
              name="mobileMoneyName"
              placeholder="Ex: Marc Dubois (M-Pesa / Airtel)"
              value={formData.mobileMoneyName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Contacts & Notes */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          Contacts & Notes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Téléphone Contact
            </label>
            <input
              type="text"
              name="contactPhone"
              placeholder="+243 900 000 000"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Contact
            </label>
            <input
              type="email"
              name="contactEmail"
              placeholder="contact@exemple.com"
              value={formData.contactEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Note Importante
          </label>
          <textarea
            name="importantNote"
            rows={2}
            placeholder="Ex: Prière de respecter le dress code blanc & or."
            value={formData.importantNote}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
        {loading ? "Création en cours..." : "Créer le Faire-Part"}
      </button>
    </form>
  );
}