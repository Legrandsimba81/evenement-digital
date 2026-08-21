// components/shops/AlgoliaSearch.tsx
"use client";

import { InstantSearchNext } from "react-instantsearch-nextjs";
import { SearchBox, Hits, RefinementList, Pagination, Configure } from "react-instantsearch";
import { searchClient } from "@/lib/algolia-search";
import { MapPin, Star, BadgeCheck, Tag, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const HitComponent = ({ hit }: { hit: any }) => (
  <Link
    href={`/boutiques/${hit.slug}`}
    className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden border border-gray-200 dark:border-gray-800"
  >
    <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500">
      {hit.coverImage ? (
        <img
          src={hit.coverImage}
          alt={hit.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
          {hit.name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
    <div className="p-4">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex-shrink-0 overflow-hidden shadow-sm">
          {hit.logo ? (
            <img src={hit.logo} alt={hit.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-800">
              {hit.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col items-start min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors truncate">
              {hit.name}
            </h2>
            {hit.isVerified && <BadgeCheck size={18} className="stroke-white fill-blue-600 flex-shrink-0" />}
          </div>
          <span className="flex items-center gap-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
            <Tag size={14} className="flex-shrink-0" />
            <span>{hit.category?.name || "Catégorie"}</span>
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between">
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          {hit.province && <span>{hit.province}</span>}
          {hit.province && hit.city && <span className="text-gray-300">•</span>}
          {hit.city && (
            <span className="flex items-center gap-1">
              <MapPin size={14} className="flex-shrink-0" /> {hit.city}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <Star size={16} className="text-yellow-500" />
          {hit.averageRating ? hit.averageRating.toFixed(1) : "N/A"} ({hit.reviewCount})
        </span>
      </div>
    </div>
  </Link>
);

export default function AlgoliaSearch() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Détection mobile (taille < 1024px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Gestion du tiroir : clic extérieur et fermeture automatique en desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    // Si on repasse en desktop, fermer le tiroir
    if (!isMobile && isFilterOpen) {
      setIsFilterOpen(false);
    }

    if (isFilterOpen && isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isFilterOpen, isMobile]);

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);
  const closeFilter = () => setIsFilterOpen(false);

  // Contenu des filtres (réutilisé)
  const FilterContent = () => (
    <>
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</label>
        <RefinementList
          attribute="category.name"
          className="mt-2"
          searchable={false}
        />
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ville</label>
        <RefinementList
          attribute="city"
          className="mt-2"
          searchable={true}
          searchablePlaceholder="Rechercher une ville..."
          limit={10}
        />
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Province</label>
        <RefinementList
          attribute="province"
          className="mt-2"
          searchable={true}
          searchablePlaceholder="Rechercher une province..."
          limit={10}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vérifié</label>
        <RefinementList
          attribute="isVerified"
          className="mt-2"
          searchable={false}
        />
      </div>
    </>
  );

  return (
    <InstantSearchNext
      searchClient={searchClient}
      indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!}
      future={{ preserveSharedStateOnUnmount: true }}
    >
      {/* Configuration : hitsPerPage fixé à 12 pour tous les écrans */}
      <Configure hitsPerPage={12} />

      <div className="relative">
        {/* Layout desktop : sidebar + contenu */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar desktop (cachée en mobile) */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sticky top-20">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Filtres</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            {/* Barre de recherche sticky avec marges négatives contrôlées */}
            <div className="sticky top-20 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm py-3 -mx-4 -mt-6 lg:-mt-3 mb-4 lg:mb-0 px-4 lg:bg-transparent lg:backdrop-blur-none lg:pb-3 lg:mx-0 lg:px-0">
              <div className="flex items-center gap-3 max-w-full">
                {/* Bouton filtre mobile */}
                <button
                  onClick={toggleFilter}
                  className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex-shrink-0"
                  aria-label="Filtrer"
                >
                  <SlidersHorizontal size={20} />
                </button>

                <div className="flex-1 min-w-0">
                  <SearchBox
                    placeholder="Rechercher un prestataire..."
                    classNames={{
                      root: "relative w-full",
                      input: "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base",
                      submit: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Résultats - grille responsive avec espacements adaptés */}
            <Hits
              hitComponent={HitComponent}
              classNames={{
                root: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
                list: "contents",
                item: "contents",
              }}
            />

            {/* Pagination responsive : boutons plus petits sur mobile et wrap */}
            <div className="mt-8 flex justify-center">
              <Pagination
                classNames={{
                  list: "flex flex-wrap justify-center gap-1 sm:gap-2",
                  item: "px-3 sm:px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition min-w-[2.5rem] text-center",
                  selectedItem: "bg-primary-500 text-white border-primary-500 hover:bg-primary-600",
                  disabledItem: "opacity-50 cursor-not-allowed",
                }}
              />
            </div>
          </div>
        </div>

        {/* Tiroir mobile (overlay) */}
        {isFilterOpen && isMobile && (
          <div className="fixed inset-0 z-50 flex">
            {/* Fond sombre */}
            <div className="absolute inset-0 bg-black/50" onClick={closeFilter}></div>
            {/* Panneau latéral */}
            <div
              ref={filterPanelRef}
              className="relative w-80 max-w-[90vw] h-full bg-white dark:bg-gray-950 shadow-2xl overflow-y-auto p-5 sm:p-6 transform transition-transform duration-300 ease-in-out"
              style={{ transform: isFilterOpen ? "translateX(0)" : "translateX(-100%)" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtres</h3>
                <button
                  onClick={closeFilter}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  aria-label="Fermer les filtres"
                >
                  <X size={20} />
                </button>
              </div>
              <FilterContent />
              <button
                onClick={closeFilter}
                className="mt-6 w-full py-2.5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition"
              >
                Appliquer
              </button>
            </div>
          </div>
        )}
      </div>
    </InstantSearchNext>
  );
}