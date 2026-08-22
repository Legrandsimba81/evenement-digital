// app/(protected)/dashboard/shops/[slug]/page.tsx
import { getShopBySlug } from "@/actions/shop-actions";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Phone,
  Globe,
  Star,
  User,
  ArrowLeft,
  Edit,
  Image,
  CheckCircle,
  XCircle,
  Users,
  Store,
  ExternalLink,
  BadgeCheck,
  Sparkles,
  Shield,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardShopDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;
    const session = await auth();
    if (!session?.user) redirect("/login");

    const shop = await getShopBySlug(slug);
    if (!shop) return notFound();

    // Vérifier les droits
    if (shop.userId !== session.user.id && session.user.role !== "ADMIN") {
      return (
        <div className="p-6 text-center">
          <p className="text-red-500">Vous n'êtes pas autorisé à voir cette boutique.</p>
        </div>
      );
    }

    const avgRating = shop.avgRating !== null ? shop.avgRating.toFixed(1) : "N/A";
    const reviewsCount = shop.reviews?.length || 0;
    const reservationsCount = shop.reservations?.length || 0;
    const tags = Array.isArray(shop.profile?.tags) ? shop.profile.tags : [];
    const images = Array.isArray(shop.profile?.images) ? shop.profile.images : [];

    // Conseils de gestion
    const tips = [
      {
        icon: Edit,
        title: "Maintenez vos informations à jour",
        description: "Vérifiez régulièrement que votre nom, description et coordonnées sont exacts.",
      },
      {
        icon: Image,
        title: "Enrichissez votre portfolio",
        description: "Ajoutez des photos de vos réalisations pour attirer plus de clients.",
      },
      {
        icon: Calendar,
        title: "Répondez aux demandes de réservation",
        description: "Consultez et gérez vos réservations rapidement pour améliorer votre taux de conversion.",
      },
      {
        icon: Star,
        title: "Sollicitez des avis",
        description: "Encouragez vos clients à laisser un avis après chaque prestation.",
      },
    ];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* En-tête avec actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/shops"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition"
              >
                <ArrowLeft size={16} />
                Retour
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {shop.name}
              </h1>
              {shop.isVerified ? (
                <BadgeCheck className="w-6 h-6 text-blue-600 fill-blue-600 dark:text-blue-500 dark:fill-blue-500 flex-shrink-0" />
              ) : (
                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                  Non vérifié
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/boutiques/${shop.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-xl transition"
              >
                <ExternalLink size={16} />
                Voir la page publique
              </Link>
              <Link
                href={`/dashboard/shops/${shop.slug}/edit`}
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm"
              >
                <Edit size={16} />
                Modifier
              </Link>
              <Link
                href={`/dashboard/shops/${shop.slug}/portfolio`}
                className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm"
              >
                <Image size={16} />
                Portfolio
              </Link>
              <Link
                href={`/dashboard/shops/${shop.slug}/reservations`}
                className="inline-flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm"
              >
                <Calendar size={16} />
                Réservations
              </Link>
              <Link
                href={`/dashboard/shops/${shop.slug}/subscription`}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm ${shop.isVerified
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                  }`}
              >
                {shop.isVerified ? <Shield size={16} /> : <Sparkles size={16} />}
                {shop.isVerified ? "Gérer l'abonnement" : "Demander la vérification"}
              </Link>
            </div>
          </div>

          {/* Grille principale */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne de gauche (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Carte de présentation */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                {shop.coverImage ? (
                  <div className="aspect-[21/9] overflow-hidden">
                    <img
                      src={shop.coverImage}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[21/9] bg-gradient-to-r from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                    <Store className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {shop.logo ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                        <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">
                        {shop.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                          {shop.name}
                        </h2>
                        {shop.isVerified && (
                          <BadgeCheck className="w-5 h-5 text-blue-600 fill-blue-600 dark:text-blue-500 dark:fill-blue-500 flex-shrink-0" />
                        )}
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${shop.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                        >
                          {shop.isActive ? "Actif" : "Inactif"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {shop.category?.name || "Catégorie non définie"}
                      </p>
                      {shop.city && (
                        <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <MapPin size={14} /> {shop.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {shop.description && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-line">
                        {shop.description}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mots-clés</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Profil professionnel */}
                  {(shop.profile?.portfolio ||
                    shop.profile?.priceRange ||
                    shop.profile?.experience ||
                    shop.profile?.availability) && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {shop.profile?.portfolio && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Portfolio :</span>
                            <p className="text-gray-800 dark:text-white">{shop.profile.portfolio}</p>
                          </div>
                        )}
                        {shop.profile?.priceRange && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Tarifs :</span>
                            <p className="text-gray-800 dark:text-white">{shop.profile.priceRange}</p>
                          </div>
                        )}
                        {shop.profile?.experience && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Expérience :</span>
                            <p className="text-gray-800 dark:text-white">{shop.profile.experience}</p>
                          </div>
                        )}
                        {shop.profile?.availability && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Disponibilité :</span>
                            <p className="text-gray-800 dark:text-white">{shop.profile.availability}</p>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Mini portfolio */}
                  {images.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Images du portfolio ({images.length})
                      </h3>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {images.slice(0, 4).map((img: any, idx: number) => (
                          <div
                            key={idx}
                            className={`overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 ${img.orientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'
                              }`}
                          >
                            <img
                              src={img.url}
                              alt={`Image ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {images.length > 4 && (
                          <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                            +{images.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Conseils de gestion */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <Sparkles size={20} className="text-primary-500" />
                  Conseils pour bien gérer votre boutique
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tips.map((tip, index) => {
                    const Icon = tip.icon;
                    return (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                            <Icon size={18} className="text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                              {tip.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              {tip.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Colonne de droite (1/3) */}
            <div className="space-y-6">
              {/* Contact */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <Phone size={18} />
                  Coordonnées
                </h3>
                <div className="space-y-3 text-sm">
                  {shop.address && (
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{shop.address}</span>
                    </div>
                  )}
                  {shop.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{shop.phone}</span>
                    </div>
                  )}
                  {shop.whatsapp && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-500 font-medium flex-shrink-0">WhatsApp</span>
                      <span className="text-gray-700 dark:text-gray-300">{shop.whatsapp}</span>
                    </div>
                  )}
                  {shop.website && (
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-gray-400 flex-shrink-0" />
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
              </div>

              {/* Statistiques */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <Users size={18} />
                  Statistiques
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Note moyenne</span>
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      {avgRating}
                      <span className="text-gray-400 font-normal ml-1">({reviewsCount} avis)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Réservations</span>
                    <span className="text-sm font-medium">{reservationsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Statut</span>
                    <span
                      className={`text-sm font-medium ${shop.isActive ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {shop.isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Vérification</span>
                    <span
                      className={`text-sm font-medium ${shop.isVerified ? "text-blue-600" : "text-gray-500"
                        }`}
                    >
                      {shop.isVerified ? "✅ Vérifié" : "❌ Non vérifié"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bouton actions rapides */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  Actions rapides
                </h3>
                <div className="space-y-2">
                  <Link
                    href={`/boutiques/${shop.slug}`}
                    target="_blank"
                    className="flex items-center justify-between w-full text-sm bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl transition"
                  >
                    <span>Voir la page publique</span>
                    <ExternalLink size={16} />
                  </Link>
                  <Link
                    href={`/dashboard/shops/${shop.slug}/edit`}
                    className="flex items-center justify-between w-full text-sm bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2.5 rounded-xl transition"
                  >
                    <span>Modifier les informations</span>
                    <Edit size={16} />
                  </Link>
                  <Link
                    href={`/dashboard/shops/${shop.slug}/portfolio`}
                    className="flex items-center justify-between w-full text-sm bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2.5 rounded-xl transition"
                  >
                    <span>Gérer le portfolio</span>
                    <Image size={16} />
                  </Link>
                  <Link
                    href={`/dashboard/shops/${shop.slug}/reservations`}
                    className="flex items-center justify-between w-full text-sm bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2.5 rounded-xl transition"
                  >
                    <span>Voir les réservations</span>
                    <Calendar size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("[DashboardShopDetail] Erreur:", error);
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Erreur</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Impossible de charger les détails de la boutique.
        </p>
        <Link href="/dashboard/shops" className="mt-4 inline-block text-blue-600 hover:underline">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }
}