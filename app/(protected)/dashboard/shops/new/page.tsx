// app/(protected)/dashboard/shops/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createShop } from "@/actions/shop-actions";
import { Loader2, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

const PROVINCES = [
  "Kinshasa", "Kongo Central", "Kwango", "Kwilu", "Mai-Ndombe",
  "Équateur", "Mongala", "Nord-Ubangi", "Sud-Ubangi", "Tshuapa",
  "Bas-Uele", "Haut-Uele", "Ituri", "Nord-Kivu", "Sud-Kivu",
  "Maniema", "Kasaï", "Kasaï-Central", "Kasaï-Oriental", "Lomami",
  "Sankuru", "Lualaba", "Haut-Katanga", "Haut-Lomami", "Tanganyika", "Tshopo",
];

const CITIES_BY_PROVINCE: Record<string, string[]> = {
  Kinshasa: ["Kinshasa"],
  "Kongo Central": ["Matadi", "Boma", "Muanda"],
  "Nord-Kivu": ["Goma", "Beni", "Butembo"],
  "Sud-Kivu": ["Bukavu", "Uvira", "Baraka"],
  "Haut-Katanga": ["Lubumbashi", "Likasi", "Kolwezi"],
  "Lualaba": ["Kolwezi", "Dilolo"],
  "Kasaï": ["Tshikapa", "Luebo"],
  "Kasaï-Central": ["Kananga", "Mbuji-Mayi"],
  "Kasaï-Oriental": ["Mbuji-Mayi", "Tshilenge"],
  "Maniema": ["Kindu", "Kasongo"],
  Ituri: ["Bunia", "Aru", "Mahagi"],
  "Haut-Uele": ["Isiro", "Watsa", "Dungu", "Niangara", "Rungu", "Durba"],
  "Bas-Uele": ["Buta", "Aketi"],
  Tshopo: ["Kisangani", "Yangambi"],
  "Nord-Ubangi": ["Gbadolite", "Zongo"],
  "Sud-Ubangi": ["Gemena"],
  Mongala: ["Lisala", "Bumba"],
  Tshuapa: ["Boende", "Ikela"],
  Équateur: ["Mbandaka", "Bikoro"],
  "Mai-Ndombe": ["Inongo", "Nioki"],
  Kwilu: ["Bandundu", "Kikwit"],
  Kwango: ["Kenge", "Popokabaka"],
  Sankuru: ["Lodja", "Lusambo"],
  Lomami: ["Kabinda", "Mwene-Ditu"],
  "Haut-Lomami": ["Kamina", "Bukama"],
  Tanganyika: ["Kalemie", "Moba"],
};

const AVAILABILITY_OPTIONS = [
  "Toujours ouvert",
  "Toujours ouvert sauf jours fériés",
  "Toujours ouvert sauf samedi et dimanche",
  "Personnalisé",
];

export default function NewShopPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string; tags?: string[] }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    province: "",
    city: "",
    address: "",
    phone: "",
    website: "",
    portfolio: "",
    priceRange: "",
    availability: "",
    availabilityCustom: "",
    experience: "",
    selectedTags: [] as string[],
    logo: "",
    coverImage: "",
  });

  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/shop-categories");
        if (!res.ok) throw new Error("Erreur chargement catégories");
        const data = await res.json();
        setCategories(data);
      } catch {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const cat = categories.find((c) => c.id === form.categoryId);
    if (cat && cat.tags) {
      setAvailableTags(cat.tags);
    } else {
      setAvailableTags([]);
    }
    setForm((prev) => ({ ...prev, selectedTags: [] }));
  }, [form.categoryId, categories]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "availability" && value !== "Personnalisé") {
      setForm((prev) => ({ ...prev, availabilityCustom: "" }));
    }
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (error) setError("");
  };

  const handleTagToggle = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  };

  const handleImageChange = (field: string) => (url: string) => {
    setForm((prev) => ({ ...prev, [field]: url }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validatePhone = (phone: string) => /^0\d{9}$/.test(phone);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Le nom de la boutique est obligatoire.";
    if (!form.categoryId) errors.categoryId = "Veuillez sélectionner une catégorie.";
    if (!form.province) errors.province = "Veuillez sélectionner une province.";
    if (!form.city) errors.city = "Veuillez sélectionner une ville.";
    if (!form.address.trim()) errors.address = "L'adresse détaillée est obligatoire.";
    if (!form.phone.trim()) errors.phone = "Le numéro de téléphone est obligatoire.";
    if (!validatePhone(form.phone)) errors.phone = "Le numéro doit contenir 10 chiffres et commencer par 0 (ex: 0827733286).";
    if (form.website.trim()) {
      try {
        new URL(form.website.trim());
      } catch {
        errors.website = "L'URL du site web est invalide (ex: https://monsite.com).";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateForm()) {
      const firstError = Object.keys(fieldErrors)[0];
      if (firstError) {
        const el = document.querySelector(`[name="${firstError}"]`) as HTMLElement;
        if (el) el.focus();
      }
      return;
    }

    setLoading(true);
    try {
      let availabilityValue = form.availability;
      if (form.availability === "Personnalisé" && form.availabilityCustom) {
        availabilityValue = form.availabilityCustom;
      }

      const shopData = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        categoryId: form.categoryId,
        city: form.city,
        address: form.address.trim(),
        phone: form.phone.trim(),
        whatsapp: form.phone.trim(),
        website: form.website.trim() || undefined,
        coverImage: form.coverImage || undefined,
        logo: form.logo || undefined,
        province: form.province,
        profile: {
          portfolio: form.portfolio.trim() || undefined,
          priceRange: form.priceRange.trim() || undefined,
          availability: availabilityValue || undefined,
          experience: form.experience.trim() || undefined,
          tags: form.selectedTags,
          images: [],
        },
      };

      const result = await createShop(shopData);
      if (result.success) {
        setSuccessMessage("✅ Boutique créée avec succès ! Redirection...");
        setTimeout(() => router.push("/dashboard/shops"), 1500);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  const cities = form.province ? CITIES_BY_PROVINCE[form.province] || [] : [];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 mb-4"
      >
        <ArrowLeft size={18} /> Retour
      </button>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Créer une boutique / prestataire</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-300">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="whitespace-pre-line">{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3 text-green-700 dark:text-green-300">
          <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>{successMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informations générales</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ex: Salon de mariage Élégance"
              className={`mt-1 w-full px-4 py-2 rounded-xl border ${
                fieldErrors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
              } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
              required
            />
            {fieldErrors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.name}</p>}
            <p className="mt-1 text-xs text-gray-400">Le nom doit être unique.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie *</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className={`mt-1 w-full px-4 py-2 rounded-xl border ${
                fieldErrors.categoryId ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
              } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {fieldErrors.categoryId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.categoryId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Présentez votre activité, vos spécialités..."
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Localisation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Province *</label>
              <select
                name="province"
                value={form.province}
                onChange={handleChange}
                className={`mt-1 w-full px-4 py-2 rounded-xl border ${
                  fieldErrors.province ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                required
              >
                <option value="">Sélectionner</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {fieldErrors.province && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.province}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ville *</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className={`mt-1 w-full px-4 py-2 rounded-xl border ${
                  fieldErrors.city ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
                required
                disabled={!form.province}
              >
                <option value="">Sélectionner</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {fieldErrors.city && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.city}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse détaillée *</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Ex: Avenue de la Révolution, N° 12"
              className={`mt-1 w-full px-4 py-2 rounded-xl border ${
                fieldErrors.address ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
              } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
              required
            />
            {fieldErrors.address && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.address}</p>}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone (WhatsApp) *</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="0827733286"
              className={`mt-1 w-full px-4 py-2 rounded-xl border ${
                fieldErrors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
              } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
              required
            />
            {fieldErrors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.phone}</p>}
            <p className="mt-1 text-xs text-gray-400">10 chiffres, commençant par 0 (ex: 0827733286).</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site web (optionnel)</label>
            <input
              name="website"
              type="url"
              value={form.website}
              onChange={handleChange}
              placeholder="https://monsite.com"
              className={`mt-1 w-full px-4 py-2 rounded-xl border ${
                fieldErrors.website ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
              } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
            />
            {fieldErrors.website && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.website}</p>}
            <p className="mt-1 text-xs text-gray-400">Doit commencer par http:// ou https://</p>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Images</h2>
          <ImageUpload
            value={form.logo}
            onChange={handleImageChange("logo")}
            label="Logo (carré, 1:1)"
          />
          <ImageUpload
            value={form.coverImage}
            onChange={handleImageChange("coverImage")}
            label="Image de couverture (paysage, 16:9)"
          />
        </div>

        {/* Profil professionnel */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profil professionnel</h2>
          {/* ... (restent les mêmes champs portfolio, priceRange, availability, experience, tags) ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio (URL ou description)</label>
            <input
              name="portfolio"
              value={form.portfolio}
              onChange={handleChange}
              placeholder="Ex: https://monportfolio.com ou '10 ans d'expérience dans les mariages'"
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fourchette de prix (optionnel)</label>
            <input
              name="priceRange"
              value={form.priceRange}
              onChange={handleChange}
              placeholder="Ex: 50-150$"
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Disponibilité</label>
            <select
              name="availability"
              value={form.availability}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choisir...</option>
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {form.availability === "Personnalisé" && (
              <input
                name="availabilityCustom"
                value={form.availabilityCustom}
                onChange={handleChange}
                placeholder="Décrivez vos horaires"
                className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expérience</label>
            <input
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="Ex: 5 ans d'expérience"
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    form.selectedTags.includes(tag)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Création en cours..." : "Créer la boutique"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/shops")}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}