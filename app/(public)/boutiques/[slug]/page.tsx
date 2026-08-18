// app/(public)/boutiques/[slug]/page.tsx
import { getShopBySlug } from "@/actions/shop-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Phone, Globe, Star, ArrowLeft, BadgeCheck } from "lucide-react";
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-4 sm:py-8 md:py-12 px-3 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <Link
                        href="/boutiques"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-4 transition"
                    >
                        <ArrowLeft size={16} /> Retour à la liste
                    </Link>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                        {/* Cover image */}
                        <div className="relative w-full aspect-[21/9] bg-gradient-to-r from-blue-500 to-purple-500">
                            {shop.coverImage ? (
                                <img
                                    src={shop.coverImage}
                                    alt={shop.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/30 text-6xl font-bold">
                                    {shop.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {shop.isVerified && (
                                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-blue-600 text-white rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-medium shadow-lg">
                                    <BadgeCheck size={14} className="stroke-white fill-blue-600" />
                                </div>
                            )}
                        </div>

                        <div className="p-4 sm:p-6 md:p-8">
                            {/* En-tête avec logo et nom */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 sm:w-24 sm:h-24 rounded-full bg-white dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                                    {shop.logo ? (
                                        <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-800">
                                            {shop.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <h1 className="text-xl sm:text-1xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
                                            {shop.name}
                                        </h1>
                                        {shop.isVerified && (
                                            <span className="inline-flex items-center gap-1 bg-blue-600 text-white rounded-full px-2.5 py-1 text-xs font-medium shadow-sm flex-shrink-0">
                                                <BadgeCheck size={14} className="stroke-white fill-blue-600" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                        <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 py-0.5 rounded-full">
                                            {shop.category?.name || "Catégorie"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{avgRating}</span>
                                            <span>({reviews.length} avis)</span>
                                        </span>
                                        {shop.city && (
                                            <span className="flex items-center gap-1">
                                                <MapPin size={14} /> {shop.city}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Corps en deux colonnes */}
                            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    {shop.description && (
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">À propos</h2>
                                            <p className="mt-1 text-gray-600 dark:text-gray-300 whitespace-pre-line">
                                                {shop.description}
                                            </p>
                                        </div>
                                    )}

                                    {profileImages.length > 0 && (
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Portfolio</h2>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                                {profileImages.slice(0, 6).map((url: string, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-[1.02] transition duration-200"
                                                    >
                                                        <img src={url} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                                {profileImages.length > 6 && (
                                                    <Link
                                                        href={`/boutiques/${shop.slug}/portfolio`}
                                                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                                    >
                                                        Voir tout ({profileImages.length})
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {tags.length > 0 && (
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Mots-clés</h2>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {tags.map((tag: string) => (
                                                    <span
                                                        key={tag}
                                                        className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="lg:col-span-1 space-y-4">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 sm:p-5 space-y-3">
                                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <Phone size={18} /> Contact
                                        </h2>
                                        {shop.phone && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Phone size={16} className="text-gray-400" />
                                                <span className="text-gray-700 dark:text-gray-300">{shop.phone}</span>
                                            </div>
                                        )}
                                        {shop.whatsapp && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-green-500 font-medium">WhatsApp</span>
                                                <span className="text-gray-700 dark:text-gray-300">{shop.whatsapp}</span>
                                            </div>
                                        )}
                                        {shop.address && (
                                            <div className="flex items-start gap-3 text-sm">
                                                <MapPin size={16} className="text-gray-400 mt-0.5" />
                                                <span className="text-gray-700 dark:text-gray-300">{shop.address}</span>
                                            </div>
                                        )}
                                        {shop.website && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Globe size={16} className="text-gray-400" />
                                                <a
                                                    href={shop.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline truncate"
                                                >
                                                    {shop.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        href={`/boutiques/${shop.slug}/reserver`}
                                        className="block w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-xl text-center transition shadow-sm"
                                    >
                                        <Calendar size={18} className="inline mr-2" />
                                        Réserver maintenant
                                    </Link>
                                </div>
                            </div>

                            {/* Avis */}
                            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Star size={20} className="text-yellow-500 fill-yellow-500" />
                                        Avis ({reviews.length})
                                    </h2>
                                    {avgRating !== "N/A" && (
                                        <span className="text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full font-medium">
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
                                    <div className="space-y-4 mt-2">
                                        {reviews.map((review: any) => (
                                            <div key={review.id} className="border-b border-gray-100 dark:border-gray-800 pb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-800 dark:text-white">
                                                        {review.user?.name || "Anonyme"}
                                                    </span>
                                                    <span className="flex items-center gap-0.5 text-yellow-500">
                                                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                                    </span>
                                                    <span className="text-xs text-gray-400 ml-auto">
                                                        {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                                                    </span>
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
                </div>
            </div>
        );
    } catch (error) {
        console.error("[BoutiquePage] ERREUR CATASTROPHIQUE:", error);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 p-4">
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