// components/shops/AlgoliaSearch.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InstantSearch, SearchBox, Hits, RefinementList, Pagination, Configure } from "react-instantsearch";
import { searchClient } from "@/lib/algolia";
import { MapPin, Star, BadgeCheck, Tag } from "lucide-react";
import Link from "next/link";

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
          <span className="flex items-center gap-1 mt-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
            <Tag size={14} className="flex-shrink-0" />
            <span>{hit.category?.name || "Catégorie"}</span>
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        {hit.province && <span>{hit.province}</span>}
        {hit.province && hit.city && <span className="text-gray-300">•</span>}
        {hit.city && (
          <span className="flex items-center gap-1">
            <MapPin size={14} className="flex-shrink-0" /> {hit.city}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {hit.priceRange || "Prix sur demande"}
        </span>
        <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <Star size={16} className="text-yellow-500" />
          {hit.averageRating ? hit.averageRating.toFixed(1) : "N/A"} ({hit.reviewCount})
        </span>
      </div>
    </div>
  </Link>
);

export default function AlgoliaSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <InstantSearch searchClient={searchClient} indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar des filtres */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sticky top-20">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Filtres</h3>
            
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
          </div>
        </aside>

        {/* Contenu principal */}
        <div className="flex-1">
          {/* Barre de recherche */}
          <div className="mb-6">
            <SearchBox
              placeholder="Rechercher un prestataire..."
              classNames={{
                root: "relative",
                input: "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                submit: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400",
              }}
            />
          </div>

          {/* Configuration de la recherche */}
          <Configure hitsPerPage={12} />

          {/* Résultats */}
          <Hits
            hitComponent={HitComponent}
            classNames={{
              root: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
              list: "contents",
              item: "contents",
            }}
          />

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <Pagination
              classNames={{
                list: "flex gap-2",
                item: "px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition",
                selectedItem: "bg-primary-500 text-white border-primary-500 hover:bg-primary-600",
                disabledItem: "opacity-50 cursor-not-allowed",
              }}
            />
          </div>
        </div>
      </div>
    </InstantSearch>
  );
}