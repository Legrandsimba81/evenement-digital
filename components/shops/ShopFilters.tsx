"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export default function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // États locaux
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [showSearch, setShowSearch] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronisation avec les paramètres d'URL
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "");
  }, [searchParams]);

  // Gestion du scroll : masquer en descendant, afficher en remontant
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 80) {
        // Masquer si on descend et qu'on a dépassé un seuil
        if (currentScrollY > lastScrollY.current) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Focus sur l'input quand la recherche s'ouvre
  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  // Appliquer les filtres
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    params.set("page", "1");
    const url = `/boutiques${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(url);
    setShowCategoryDropdown(false);
    setShowSearch(false);
  }, [search, category, router]);

  // Réinitialiser
  const clearFilters = () => {
    setSearch("");
    setCategory("");
    router.replace("/boutiques");
    setShowSearch(false);
    setShowCategoryDropdown(false);
  };

  // Soumettre avec Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") applyFilters();
  };

  // Sélectionner une catégorie
  const handleCategorySelect = (catId: string) => {
    setCategory(catId);
    setShowCategoryDropdown(false);
    // Appliquer automatiquement après sélection
    setTimeout(() => applyFilters(), 100);
  };

  // Noms des catégories pour affichage
  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : "Catégorie";
  };

  return (
    <div
      className={`sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Ligne d'icônes */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Icône de recherche */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                showSearch ? "text-primary-500" : "text-gray-600 dark:text-gray-300"
              }`}
              aria-label="Rechercher"
            >
              <Search size={20} />
            </button>

            {/* Icône de filtre par catégorie */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-1 ${
                  category ? "text-primary-500" : "text-gray-600 dark:text-gray-300"
                }`}
                aria-label="Filtrer par catégorie"
              >
                <SlidersHorizontal size={20} />
                {category && (
                  <span className="hidden sm:inline text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded-full">
                    {getCategoryName(category)}
                  </span>
                )}
                <ChevronDown size={14} className={`transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown des catégories */}
              {showCategoryDropdown && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
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
          </div>

          {/* Réinitialisation */}
          {(search || category) && (
            <button
              onClick={clearFilters}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300"
              aria-label="Réinitialiser les filtres"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Barre de recherche (affichée si showSearch) */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            showSearch ? "max-h-16 opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
        >
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher un prestataire..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={applyFilters}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition"
              aria-label="Lancer la recherche"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Indicateur de filtres actifs (version mobile) */}
        {(search || category) && (
          <div className="flex flex-wrap gap-1 mt-1 sm:hidden">
            {search && (
              <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                {search}
              </span>
            )}
            {category && (
              <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
                {getCategoryName(category)}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}