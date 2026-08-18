// app/(protected)/dashboard/shops/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2, Images, MapPin, Star } from "lucide-react";
import DeleteShopButton from "@/components/shops/DeleteShopButton";

export default async function DashboardShopsPage() {
  const session = await auth();
  if (!session?.user) return <div className="p-6">Connectez-vous pour voir vos boutiques.</div>;

  const shops = await prisma.shop.findMany({
    where: { userId: session.user.id },
    include: {
      category: { select: { name: true } },
      profile: { select: { images: true } },
      reviews: { select: { id: true, rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calcul de la note moyenne pour chaque boutique
  const shopsWithRating = shops.map((shop) => {
    // Sécurisation des reviews
    const reviews = shop.reviews ?? [];
    const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : "N/A";
    
    // Sécurisation des images du profil
    const profileImages = Array.isArray(shop.profile?.images) 
      ? (shop.profile.images as any[]).filter((img: any): img is string => typeof img === "string")
      : [];
    
    return { ...shop, avgRating, profileImages };
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes boutiques</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez vos prestations et services événementiels</p>
        </div>
        <Link
          href="/dashboard/shops/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition shadow-sm hover:shadow"
        >
          <Plus size={18} /> Créer une boutique
        </Link>
      </div>

      {shops.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <Plus size={40} className="text-blue-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Aucune boutique</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
            Vous n'avez pas encore créé de boutique. Commencez dès maintenant à proposer vos services.
          </p>
          <Link
            href="/dashboard/shops/new"
            className="inline-flex items-center gap-2 mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition"
          >
            <Plus size={18} /> Créer ma première boutique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopsWithRating.map((shop) => (
            <div
              key={shop.id}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition group"
            >
              {/* Cover image */}
              <div className="relative h-32 bg-gradient-to-r from-primary-500 to-secondary-500">
                {shop.coverImage ? (
                  <img src={shop.coverImage} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-6xl font-bold">
                    {shop.name.charAt(0)}
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${shop.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}>
                    {shop.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>

              {/* Logo & infos */}
              <div className="p-5">
                <div className="flex items-start gap-4 -mt-10">
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {shop.logo ? (
                      <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                        {shop.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{shop.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{shop.category?.name || "Catégorie"}</p>
                  </div>
                </div>

                {/* Détails */}
                <div className="mt-4 space-y-2 text-sm">
                  {shop.city && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{shop.city}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Star size={16} className="text-yellow-500" />
                    <span>{shop.avgRating} ({shop.reviews.length} avis)</span>
                  </div>
                  {shop.profileImages.length > 0 && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Images size={16} className="text-gray-400" />
                      <span>{shop.profileImages.length} photos</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <Link
                    href={`/boutiques/${shop.slug}`}
                    target="_blank"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Voir la page
                  </Link>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <Link
                    href={`/dashboard/shops/${shop.slug}/portfolio`}
                    className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    Portfolio
                  </Link>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <Link
                    href={`/dashboard/shops/${shop.slug}/edit`}
                    className="text-sm text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                  >
                    Modifier
                  </Link>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <DeleteShopButton slug={shop.slug} name={shop.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}