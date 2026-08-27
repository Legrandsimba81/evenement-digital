import Link from "next/link";
import { Store, Plus, ChevronRight } from "lucide-react";

type Shop = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  city?: string | null;
  category?: { name: string } | null;
};

interface ProfileShopsCardProps {
  shops: Shop[];
}

export function ProfileShopsCard({ shops }: ProfileShopsCardProps) {
  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Store size={18} className="text-blue-500" />
          Mes boutiques
        </h3>
        <Link
          href="/dashboard/shops"
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
        >
          Gérer <ChevronRight size={16} />
        </Link>
      </div>
      {shops.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
            Vous n'avez pas encore de boutique.
          </p>
          <Link
            href="/dashboard/shops/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            <Plus size={16} /> Créer une boutique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shops.map((shop) => (
            <Link
              key={shop.id}
              href={`/dashboard/shops/${shop.slug}`}
              className="block bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:shadow-md transition border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                {shop.logo ? (
                  <img src={shop.logo} alt={shop.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Store size={24} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{shop.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {shop.category?.name || "Catégorie non définie"}
                    {shop.city && ` • ${shop.city}`}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          {shops.length >= 1 && (
            <Link
              href="/dashboard/shops/new"
              className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 hover:border-blue-500 transition text-gray-500 hover:text-blue-500"
            >
              <Plus size={18} /> Ajouter
            </Link>
          )}
        </div>
      )}
    </div>
  );
}