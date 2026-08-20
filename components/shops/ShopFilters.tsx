"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export default function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Synchronisation avec l'URL (ex: navigation via le bouton retour)
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "");
  }, [searchParams]);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    params.set("page", "1");
    const query = params.toString();
    const url = `/boutiques${query ? `?${query}` : ""}`;
    router.push(url);
    setShowCategoryDropdown(false);
  }, [search, category, router]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
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

  return (
    <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 py-3 px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-3">
        {/* Barre de recherche */}
        <div className="relative flex-1 w-full sm:w-auto">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un prestataire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Actions : Rechercher, Catégorie, Effacer */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={applyFilters}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition font-medium flex items-center justify-center gap-1"
          >
            <Search size={18} />
            <span className="sm:hidden">Rechercher</span>
          </button>

          {/* Filtre catégorie avec dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className={`px-4 py-2.5 rounded-xl border transition flex items-center gap-2 ${
                category
                  ? "bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <SlidersHorizontal size={18} />
              <span className="hidden sm:inline">
                {category ? getCategoryName(category) : "Catégorie"}
              </span>
              <span className="hidden sm:inline text-gray-400">▾</span>
            </button>

            {showCategoryDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="py-1 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => handleCategorySelect("")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
                  >
                    Toutes les catégories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Réinitialisation */}
          {(search || category) && (
            <button
              onClick={clearFilters}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400"
              aria-label="Réinitialiser"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}