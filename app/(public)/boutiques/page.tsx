import { getShopCategories, getShops } from "@/actions/shop-actions";
import Link from "next/link";
import Image from "next/image";

export default async function BoutiquesPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const categories = await getShopCategories();
  const { shops, total } = await getShops({
    categoryId: searchParams.category,
    search: searchParams.search,
    page,
  });

  const selectedCategory = searchParams.category || "";
  const searchQuery = searchParams.search || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Boutiques & prestataires</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Trouvez les meilleurs prestataires pour votre événement.
        </p>

        <form method="get" className="grid gap-4 sm:grid-cols-[1fr_auto] items-end mb-8">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recherche par nom</span>
              <input
                name="search"
                defaultValue={searchQuery}
                placeholder="Rechercher une boutique"
                className="mt-2 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrer par catégorie</span>
              <select
                name="category"
                defaultValue={selectedCategory}
                className="mt-2 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-primary-500 px-6 py-3 text-white transition hover:bg-primary-600"
          >
            Rechercher
          </button>
        </form>

        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          {total} boutique{total > 1 ? "s" : ""} trouvée{total > 1 ? "s" : ""}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Link key={shop.id} href={`/boutiques/${shop.slug}`} className="group">
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