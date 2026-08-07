import { getShops } from "@/actions/shop-actions";
import Link from "next/link";
import Image from "next/image";

export default async function BoutiquesPage({
  searchParams,
}: {
  searchParams: { category?: string; city?: string; search?: string; page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const { shops, total } = await getShops({
    categoryId: searchParams.category,
    city: searchParams.city,
    search: searchParams.search,
    page,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Boutiques & prestataires</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Trouvez les meilleurs prestataires pour votre événement.
        </p>
        {/* Filtres à implémenter plus tard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Link key={shop.id} href={`/boutique/${shop.slug}`} className="group">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
                {shop.coverImage ? (
                  <div className="aspect-video overflow-hidden">
                    <img src={shop.coverImage} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl">
                    {shop.name.charAt(0)}
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{shop.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{shop.description}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-primary-500">{shop.category?.name}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{shop.city || "Non spécifié"}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {shop.profile?.priceRange || "Prix sur demande"}
                    </span>
                    <span className="text-xs text-gray-400">{shop.reviews.length} avis</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {/* Pagination à ajouter plus tard */}
      </div>
    </div>
  );
}