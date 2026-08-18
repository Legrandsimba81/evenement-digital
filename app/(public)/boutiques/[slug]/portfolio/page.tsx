// app/(public)/boutiques/[slug]/portfolio/page.tsx
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
    description: `Découvrez les réalisations de ${shop.name}.`,
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img: any, index: number) => {
                  const isPortrait = img.orientation === 'portrait';
                  return (
                    <div
                      key={index}
                      className={`group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:shadow-lg transition ${
                        isPortrait ? 'aspect-[3/4]' : 'aspect-[4/3]'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${shop.name} - ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
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