import { getShopBySlug } from "@/actions/shop-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Phone,
  Globe,
  Star,
  ArrowLeft,
  BadgeCheck,
  Tag,
  MessageCircle,
} from "lucide-react";
import ReviewForm from "@/components/shops/ReviewForm";

export const dynamic = "force-dynamic";

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
  } catch {
    return { title: "Erreur" };
  }
}

export default async function BoutiquePage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-red-600">Erreur</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Aucun slug fourni.</p>
            <Link href="/boutiques" className="mt-4 inline-block text-blue-600 hover:underline">
              Retour à la liste
            </Link>
          </div>
        </div>
      );
    }

    const shop = await getShopBySlug(slug);
    if (!shop) return notFound();

    const profile = shop.profile || { images: [], tags: [] };
    const avgRating = shop.avgRating !== null ? shop.avgRating.toFixed(1) : "N/A";
    const reviews = shop.reviews || [];
    const tags = Array.isArray(profile.tags) ? profile.tags : [];
    const profileImages = Array.isArray(profile.images) ? profile.images : [];

    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 py-4 sm:py-8 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Bouton retour */}
          <Link
            href="/boutiques"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
          >
            <ArrowLeft size={18} /> Retour aux boutiques
          </Link>

          {/* En-tête style Pinterest (Profil à gauche, Couverture à droite) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Colonne gauche : Infos profil & CTA */}
            <div className="lg:col-span-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                  {shop.logo ? (
                    <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                      {shop.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {shop.name}
                    </h1>
                    {shop.isVerified && (
                      <BadgeCheck size={22} className="stroke-white fill-blue-600 shrink-0" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1 font-medium text-primary-500 dark:text-primary-400">
                      <Tag size={14} /> {shop.category?.name || "Catégorie"}
                    </span>
                    {shop.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {shop.city}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-1 text-xs sm:text-sm">
                    <Star size={15} className="text-yellow-500 fill-yellow-500 shrink-0" />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{avgRating}</span>
                    <span className="text-gray-500">({reviews.length} avis)</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {shop.description && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {shop.description}
                </p>
              )}

              {/* Infos Contact */}
              <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                {shop.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={15} className="text-gray-400" />
                    <span>{shop.phone}</span>
                  </div>
                )}
                {shop.address && (
                  <div className="flex items-start gap-2">
                    <MapPin size={15} className="text-gray-400 mt-0.5" />
                    <span>{shop.address}</span>
                  </div>
                )}
                {shop.website && (
                  <div className="flex items-center gap-2">
                    <Globe size={15} className="text-gray-400" />
                    <a
                      href={shop.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      {shop.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>

              {/* Mots-clés */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions CTA : WhatsApp + Réserver */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {shop.whatsapp && (
                  <a
                    href={`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-3 rounded-2xl transition shadow-sm text-sm"
                  >
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                )}

                <Link
                  href={`/boutiques/${shop.slug}/reserver`}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 dark:bg-primary-500 dark:text-white dark:hover:bg-primary-600 text-white font-medium px-4 py-3 rounded-2xl transition shadow-sm text-sm"
                >
                  <Calendar size={18} /> Réserver
                </Link>
              </div>
            </div>

            {/* Colonne droite : Couverture style Pinterest */}
            <div className="lg:col-span-7">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-md">
                {shop.coverImage ? (
                  <img
                    src={shop.coverImage}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white/30 text-8xl font-black">
                    {shop.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grille Portfolio Masonry */}
          {profileImages.length > 0 && (
            <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Réalisations
              </h2>

              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
                {profileImages.map((img: any, idx: number) => (
                  <div
                    key={idx}
                    className="break-inside-avoid overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 hover:opacity-90 transition duration-200 cursor-pointer border border-gray-100 dark:border-gray-800"
                  >
                    <img
                      src={img.url}
                      alt={`Portfolio ${idx + 1}`}
                      className="w-full h-auto object-contain block"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Avis */}
          <div className="pt-8 border-t border-gray-100 dark:border-gray-800 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Star size={20} className="text-yellow-500 fill-yellow-500" />
                Avis ({reviews.length})
              </h2>
              {avgRating !== "N/A" && (
                <span className="text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full font-semibold">
                  {avgRating} / 5
                </span>
              )}
            </div>

            <ReviewForm shopSlug={shop.slug} />

            {reviews.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                Aucun avis pour le moment. Soyez le premier à donner votre avis !
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800 dark:text-white text-sm">
                        {review.user?.name || "Anonyme"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 text-yellow-500 text-sm">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                    {review.comment && (
                      <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  } catch (error) {
    console.error("[BoutiquePage] ERREUR CATASTROPHIQUE:", error);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
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