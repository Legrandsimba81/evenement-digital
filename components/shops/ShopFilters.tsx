"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Search, X, SlidersHorizontal, MapPin } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export default function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Synchronisation avec l'URL
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "");
    setCity(searchParams.get("city") || "");
  }, [searchParams]);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    if (city.trim()) params.set("city", city.trim());
    params.set("page", "1");
    const query = params.toString();
    const url = `/boutiques${query ? `?${query}` : ""}`;
    router.push(url);
    setShowCategoryDropdown(false);
  }, [search, category, city, router]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setCity("");
    router.push("/boutiques");
    setShowCategoryDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") applyFilters();
  };

  const handleCategorySelect = (catId: string) => {
    setCategory(catId);
    setShowCategoryDropdown(false);
    applyFilters();
  };

  const getCategoryName = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.name : "Catégorie";
  };

  // Indique si des filtres sont actifs
  const hasFilters = !!(search || category || city);

  return (
    <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 py-2 px-2 sm:px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 flex-nowrap overflow-x-auto">
        {/* Champ recherche (nom) avec icône */}
        <div className="relative flex-1 min-w-[80px]">
          <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Nom"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-7 pr-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Champ ville avec icône */}
        <div className="relative flex-1 min-w-[70px]">
          <MapPin size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Ville"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-7 pr-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Bouton catégorie avec icône */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition ${
              category
                ? "bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300"
                : "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">{category ? getCategoryName(category) : "Catégorie"}</span>
            <span className="text-gray-400">▾</span>
          </button>
          {showCategoryDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
              <div className="py-1 max-h-60 overflow-y-auto">
                <button
                  onClick={() => handleCategorySelect("")}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
                >
                  Toutes
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bouton recherche (icône) */}
        <button
          onClick={applyFilters}
          className="flex-shrink-0 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition"
        >
          <Search size={16} />
        </button>

        {/* Bouton reset (icône, affiché si filtres actifs) */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex-shrink-0 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}