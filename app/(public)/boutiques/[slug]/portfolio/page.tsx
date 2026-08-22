import { getShopBySlug } from "@/actions/shop-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Images } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) return { title: "Portfolio" };
  return {
    title: `Portfolio de ${shop.name} - Octavia Event`,
    description: `Découvrez toutes les réalisations et photos de l'événementiel de ${shop.name}.`,
  };
}

export default async function PortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) return notFound();

  const images = Array.isArray(shop.profile?.images) ? shop.profile.images : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href={`/boutiques/${shop.slug}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-4 transition"
        >
          <ArrowLeft size={16} /> Retour à la boutique
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Images size={24} className="text-primary-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Portfolio de {shop.name}
              </h1>
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                {images.length} image{images.length > 1 ? 's' : ''}
              </span>
            </div>

            {shop.profile?.portfolio && (
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                {shop.profile.portfolio}
              </p>
            )}

            {images.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Images size={32} className="text-gray-400" />
                </div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Aucune image dans le portfolio.</p>
              </div>
            ) : (
              /* Changement ici : Grille Masonry fluide à 2, 3 puis 4 colonnes */
              <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
                {images.map((img: any, index: number) => {
                  return (
                    <div
                      key={index}
                      className="break-inside-avoid rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:shadow-lg transition duration-300"
                    >
                      {/* w-full h-auto et object-contain affichent l'image sans aucun zoom */}
                      <img
                        src={img.url}
                        /* Optimisation SEO : texte descriptif clair pour Google */
                        alt={`Réalisation de ${shop.name} - Photo ${index + 1}`}
                        className="w-full h-auto object-contain block hover:scale-[1.03] transition duration-300"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
