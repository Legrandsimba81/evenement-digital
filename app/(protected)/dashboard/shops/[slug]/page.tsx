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

    // Vérifier que l'utilisateur est le propriétaire ou admin
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

    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard/shops"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft size={16} /> Retour à mes boutiques
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/shops/${shop.slug}/edit`}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              <Edit size={16} /> Modifier
            </Link>
            <Link
              href={`/dashboard/shops/${shop.slug}/portfolio`}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              <Image size={16} /> Portfolio
            </Link>
            <Link
              href={`/dashboard/shops/${shop.slug}/reservations`}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              <Calendar size={16} /> Réservations
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-800">
          {shop.coverImage && (
            <div className="aspect-[21/9] overflow-hidden">
              <img
                src={shop.coverImage}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center gap-4">
              {shop.logo && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                  <img
                    src={shop.logo}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {shop.name}
                  {shop.isVerified && (
                    <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-500" />
                  )}
                  {!shop.isActive && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                      Inactif
                    </span>
                  )}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">
                    {shop.category?.name || "Sans catégorie"}
                  </span>
                  {shop.city && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {shop.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {shop.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Description
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{shop.description}</p>
                  </div>
                )}
                {shop.profile?.portfolio && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Portfolio
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{shop.profile.portfolio}</p>
                  </div>
                )}
                {shop.profile?.priceRange && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Tarifs
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{shop.profile.priceRange}</p>
                  </div>
                )}
                {shop.profile?.experience && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Expérience
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{shop.profile.experience}</p>
                  </div>
                )}
                {shop.profile?.availability && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Disponibilité
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{shop.profile.availability}</p>
                  </div>
                )}
                {tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Mots-clés
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Images du portfolio
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {images.slice(0, 4).map((img: any, idx: number) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={`Image ${idx+1}`}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ))}
                      {images.length > 4 && (
                        <span className="text-sm text-gray-500">
                          +{images.length - 4} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Coordonnées
                  </h3>
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
                      <a
                        href={shop.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {shop.website}
                      </a>
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Statistiques
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <Star size={16} className="text-yellow-500" /> Note moyenne
                    </span>
                    <span className="font-medium">
                      {avgRating} ({reviewsCount} avis)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <Users size={16} /> Réservations
                    </span>
                    <span className="font-medium">{reservationsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <CheckCircle size={16} className="text-green-500" /> Statut
                    </span>
                    <span
                      className={`font-medium ${
                        shop.isActive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {shop.isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>
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