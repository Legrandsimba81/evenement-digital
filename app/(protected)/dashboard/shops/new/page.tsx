"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createShop } from "@/actions/shop-actions";
import { Loader2 } from "lucide-react";

export default function NewShopPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    address: "",
    city: "",
    phone: "",
    whatsapp: "",
    website: "",
    portfolio: "",
    priceRange: "",
    availability: "",
    experience: "",
    tags: "",
    socialLinks: "",
    logo: "",
    coverImage: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.categoryId) {
      setError("Le nom et la catégorie sont obligatoires.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const tagsArray = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      let socialLinks = {};
      try { socialLinks = JSON.parse(form.socialLinks); } catch {}

      await createShop({
        name: form.name,
        description: form.description,
        categoryId: form.categoryId,
        address: form.address,
        city: form.city,
        phone: form.phone,
        whatsapp: form.whatsapp,
        website: form.website,
        portfolio: form.portfolio,
        priceRange: form.priceRange,
        availability: form.availability,
        experience: form.experience,
        tags: tagsArray,
        socialLinks,
        logo: form.logo,
        coverImage: form.coverImage,
      });
      router.push("/dashboard/shops");
    } catch (err: any) {
      setError(err.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Créer une boutique</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom *</label>
          <input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full px-4 py-2 rounded-xl border" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie *</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange} className="mt-1 w-full px-4 py-2 rounded-xl border" required>
            <option value="">Sélectionner</option>
            {/* Charger les catégories depuis la base (à faire) */}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="mt-1 w-full px-4 py-2 rounded-xl border" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ville</label>
            <input name="city" value={form.city} onChange={handleChange} className="mt-1 w-full px-4 py-2 rounded-xl border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
            <input name="address" value={form.address} onChange={handleChange} className="mt-1 w-full px-4 py-2 rounded-xl border" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="mt-1 w-full px-4 py-2 rounded-xl border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp</label>
            <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className="mt-1 w-full px-4 py-2 rounded-xl border" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site web</label>
          <input name="website" value={form.website} onChange={handleChange} className="mt-1 w-full px-4 py-2 rounded-xl border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio (description ou URL)</label>
          <input name="portfolio" value={form.portfolio} onChange={handleChange} className="mt-1 w-full px-4 py-2 rounded-xl border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fourchette de prix</label>
          <input name="priceRange" value={form.priceRange} onChange={handleChange} placeholder="50-150$" className="mt-1 w-full px-4 py-2 rounded-xl border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Disponibilité (texte)</label>
          <input name="availability" value={form.availability} onChange={handleChange} placeholder="Lun-Ven 9h-18h" className="mt-1 w-full px-4 py-2 rounded-xl border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expérience</label>
          <input name="experience" value={form.experience} onChange={handleChange} placeholder="5 ans d'expérience" className="mt-1 w-full px-4 py-2 rounded-xl border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (séparés par des virgules)</label>
          <input name="tags" value={form.tags} onChange={handleChange} placeholder="mariage, anniversaire, professionnel" className="mt-1 w-full px-4 py-2 rounded-xl border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo (URL)</label>
          <input name="logo" value={form.logo} onChange={handleChange} className="mt-1 w-full px-4 py-2 rounded-xl border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image de couverture (URL)</label>
          <input name="coverImage" value={form.coverImage} onChange={handleChange} className="mt-1 w-full px-4 py-2 rounded-xl border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Réseaux sociaux (JSON)</label>
          <input name="socialLinks" value={form.socialLinks} onChange={handleChange} placeholder='{"facebook":"...","instagram":"..."}' className="mt-1 w-full px-4 py-2 rounded-xl border" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Création..." : "Créer la boutique"}
        </button>
      </form>
    </div>
  );
}