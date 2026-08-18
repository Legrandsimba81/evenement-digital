// app/(public)/boutiques/[slug]/page.tsx
import { getShopBySlug } from "@/actions/shop-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Phone, Globe, Star, ArrowLeft, BadgeCheck } from "lucide-react";

export const dynamic = "force-dynamic";

// ✅ generateMetadata avec await params
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug) return { title: "Boutique introuvable" };
    const shop = await getShopBySlug(slug);
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
  } catch (error) {
    console.error("[generateMetadata] Erreur:", error);
    return { title: "Erreur de chargement" };
  }
}

// ✅ Page avec await params
export default async function BoutiquePage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug) {
      console.error("[BoutiquePage] slug manquant");
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
            <h1 className="text-2xl font-bold text-red-600">Erreur</h1>
            <p className="mt-2">Aucun slug de boutique fourni.</p>
            <Link href="/boutiques" className="mt-4 inline-block text-blue-600 hover:underline">
              Retour à la liste
            </Link>
          </div>
        </div>
      );
    }

    console.log(`[BoutiquePage] Début du chargement pour slug: "${slug}"`);
    const shop = await getShopBySlug(slug);
    console.log(`[BoutiquePage] Résultat de getShopBySlug:`, shop ? 'boutique trouvée' : 'null');

    if (!shop) {
      console.log(`[BoutiquePage] Boutique non trouvée, appel à notFound()`);
      return notFound();
    }

    const avgRating = shop.avgRating !== null ? shop.avgRating.toFixed(1) : "N/A";
    const reviews = shop.reviews || [];
    const tags = Array.isArray(shop.profile?.tags) ? shop.profile.tags : [];
    const profileImages = Array.isArray(shop.profile?.images) ? shop.profile.images : [];

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {shop.name}
                  {shop.isVerified && (
                    <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500" />
                  )}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">
                    {shop.category?.name || "Catégorie"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500" />
                    {avgRating} ({reviews.length} avis)
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
                {tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Mots-clés</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tags.map((tag: string) => (
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
                    <Globe size={18} />{" "}
                    <a href={shop.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {shop.website}
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={`/boutiques/${shop.slug}/reserver`}
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition"
              >
                <Calendar size={20} /> Réserver maintenant
              </Link>
              {profileImages.length > 0 && (
                <Link
                  href={`/boutiques/${shop.slug}/portfolio`}
                  className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-3 rounded-xl font-medium transition"
                >
                  Voir le portfolio ({profileImages.length})
                </Link>
              )}
            </div>

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                Avis ({reviews.length})
              </h3>
              {reviews.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 mt-2">Aucun avis pour le moment.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 dark:text-white">
                          {review.user?.name || "Anonyme"}
                        </span>
                        <span className="text-yellow-500 flex items-center gap-0.5">
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                        </span>
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
  } catch (error) {
    console.error("[BoutiquePage] ERREUR CATASTROPHIQUE:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Oups !</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Impossible de charger cette boutique. Nous avons été notifiés.
          </p>
          <Link href="/boutiques" className="mt-4 inline-block text-blue-600 hover:underline">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }
}