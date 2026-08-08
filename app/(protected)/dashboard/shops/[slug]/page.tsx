import { getShop } from "@/actions/shop-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Phone, Globe, Star, User, ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const shop = await getShop(params.slug);
  if (!shop) return { title: "Boutique introuvable" };
  return {
    title: shop.name,
    description: shop.description || `Découvrez ${shop.name} sur Octavia Event.`,
    openGraph: {
      title: shop.name,
      description: shop.description || "",
      images: shop.logo ? [{ url: shop.logo }] : [],
    },
  };
}

export default async function BoutiquePage({ params }: { params: { slug: string } }) {
  const shop = await getShop(params.slug);
  if (!shop) return notFound();

  const avgRating = shop.reviews.length
    ? (shop.reviews.reduce((sum, r) => sum + r.rating, 0) / shop.reviews.length).toFixed(1)
    : "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
        {shop.coverImage && (
          <div className="aspect-[21/9] overflow-hidden">
            <img src={shop.coverImage} alt={shop.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-4">
            {shop.logo && (
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md flex-shrink-0">
                <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{shop.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">
                  {shop.category?.name}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-500" />
                  {avgRating} ({shop.reviews.length} avis)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {shop.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">À propos</h3>
                  <p className="text-gray-600 dark:text-gray-300">{shop.description}</p>
                </div>
              )}
              {shop.profile?.portfolio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Portfolio</h3>
                  <p className="text-gray-600 dark:text-gray-300">{shop.profile.portfolio}</p>
                </div>
              )}
              {shop.profile?.priceRange && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Tarifs</h3>
                  <p className="text-gray-600 dark:text-gray-300">{shop.profile.priceRange}</p>
                </div>
              )}
              {shop.profile?.experience && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Expérience</h3>
                  <p className="text-gray-600 dark:text-gray-300">{shop.profile.experience}</p>
                </div>
              )}
              {shop.profile?.tags && shop.profile.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Mots-clés</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {shop.profile.tags.map((tag) => (
                      <span key={tag} className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-300">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Coordonnées</h3>
              {shop.city && (
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <MapPin size={18} /> {shop.city}
                </p>
              )}
              {shop.address && (
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <MapPin size={18} /> {shop.address}
                </p>
              )}
              {shop.phone && (
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Phone size={18} /> {shop.phone}
                </p>
              )}
              {shop.whatsapp && (
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span className="text-green-500">WhatsApp</span> {shop.whatsapp}
                </p>
              )}
              {shop.website && (
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Globe size={18} /> <a href={shop.website} target="_blank" className="text-blue-600 hover:underline">{shop.website}</a>
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/boutique/${shop.slug}/reserver`}
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition"
            >
              <Calendar size={20} /> Réserver maintenant
            </Link>
            {shop.profile?.images && (shop.profile.images as string[]).length > 0 && (
              <Link
                href={`/boutique/${shop.slug}/portfolio`}
                className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-3 rounded-xl font-medium transition"
              >
                Voir le portfolio
              </Link>
            )}
          </div>

          {/* Avis */}
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              Avis ({shop.reviews.length})
            </h3>
            {shop.reviews.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 mt-2">Aucun avis pour le moment.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {shop.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 dark:text-white">{review.user?.name || "Anonyme"}</span>
                      <span className="text-yellow-500 flex items-center gap-0.5">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {review.comment && <p className="text-gray-600 dark:text-gray-300 mt-1">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}