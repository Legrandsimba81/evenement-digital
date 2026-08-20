// app/(public)/boutiques/page.tsx
import { prisma } from "@/lib/prisma";
import { getShops } from "@/actions/shop-actions";
import Link from "next/link";
import { MapPin, Star, Store, BadgeCheck, Tag } from "lucide-react";
import ShopFilters from "@/components/shops/ShopFilters";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Boutiques et prestataires - Octavia Event",
  description: "Trouvez les meilleurs prestataires pour votre événement en RDC.",
};

export default async function BoutiquesPage({
  searchParams,
}: {
  searchParams: { category?: string; city?: string; search?: string; page?: string };
}) {
  try {
    const page = Number(searchParams.page) || 1;
    const limit = 12;

    const { shops, total } = await getShops({
      categoryId: searchParams.category,
      city: searchParams.city,
      search: searchParams.search,
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit);
    const categories = await prisma.shopCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
        {/* Barre de filtres fixe */}
        <ShopFilters categories={categories} />

        {/* Contenu principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Prestataires événementiels
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Trouvez les meilleurs professionnels pour votre événement en RDC.
          </p>

          {shops.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-12 text-center">
              <Store className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Aucun prestataire ne correspond à vos critères.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {shops.map((shop) => (
                  <Link
                    key={shop.id}
                    href={`/boutiques/${shop.slug}`}
                    className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden border border-gray-200 dark:border-gray-800"
                  >
                    {shop.coverImage ? (
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={shop.coverImage}
                          alt={shop.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-4xl font-bold">
                        {shop.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex-shrink-0 overflow-hidden shadow-sm">
                          {shop.logo ? (
                            <img
                              src={shop.logo}
                              alt={shop.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-800">
                              {shop.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-start min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors truncate">
                              {shop.name}
                            </h2>
                            {shop.isVerified && (
                              <BadgeCheck
                                size={18}
                                className="stroke-white fill-blue-600 flex-shrink-0"
                              />
                            )}
                          </div>
                          <span className="flex items-center gap-1 mt-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                            <Tag size={14} className="flex-shrink-0" />
                            <span>{shop.category?.name || "Catégorie"}</span>
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        {shop.province && <span>{shop.province}</span>}
                        {shop.province && shop.city && <span className="text-gray-300">•</span>}
                        {shop.city && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} className="flex-shrink-0" /> {shop.city}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {shop.profile?.priceRange || "Prix sur demande"}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Star size={16} className="text-yellow-500" />
                          {shop.avgRating !== null ? shop.avgRating.toFixed(1) : "N/A"} ({shop.reviews.length})
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isActive = p === page;
                    const params = new URLSearchParams({
                      ...(searchParams.category && { category: searchParams.category }),
                      ...(searchParams.city && { city: searchParams.city }),
                      ...(searchParams.search && { search: searchParams.search }),
                      page: String(p),
                    });
                    return (
                      <Link
                        key={p}
                        href={`/boutiques?${params.toString()}`}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                          isActive
                            ? "bg-primary-500 text-white"
                            : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erreur dans BoutiquesPage:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Erreur de chargement</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Impossible de charger la liste des boutiques. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    );
  }
}