// components/contact/ContactForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { sendContactMessage } from "@/actions/contact-actions";
import { Loader2, Send, CheckCircle } from "lucide-react";

export default function ContactForm() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Pré-remplir avec les données de la session
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess(false);
  };

  const validatePhone = (phone: string) => /^0\d{9}$/.test(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!formData.name.trim()) {
      setError("Veuillez entrer votre nom.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Veuillez entrer votre email.");
      return;
    }
    if (!formData.email.includes("@")) {
      setError("Veuillez entrer un email valide.");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Veuillez entrer votre numéro de téléphone.");
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError("Le numéro doit contenir 10 chiffres et commencer par 0 (ex: 0827733286).");
      return;
    }
    if (!formData.subject.trim()) {
      setError("Veuillez entrer un sujet.");
      return;
    }
    if (!formData.message.trim() || formData.message.length < 10) {
      setError("Veuillez entrer un message d'au moins 10 caractères.");
      return;
    }

    setLoading(true);
    try {
      await sendContactMessage(formData);
      setSuccess(true);
      setFormData((prev) => ({
        ...prev,
        subject: "",
        message: "",
      }));
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-3 rounded-xl flex items-center gap-2">
          <CheckCircle size={18} />
          <span>Votre message a été envoyé avec succès ! Nous vous répondrons rapidement.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="0827733286"
          className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
        <p className="mt-1 text-xs text-gray-400">10 chiffres, commençant par 0</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sujet *</label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Ex: Problème de connexion"
          className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message *</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          placeholder="Décrivez votre demande en détail..."
          className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-xl transition disabled:opacity-50 shadow-sm"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        {loading ? "Envoi en cours..." : "Envoyer le message"}
      </button>
    </form>
  );
}