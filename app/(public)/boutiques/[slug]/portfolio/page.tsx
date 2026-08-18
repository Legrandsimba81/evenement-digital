// app/(public)/boutiques/[slug]/portfolio/page.tsx
import { getShopBySlug } from "@/actions/shop-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageOff } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const shop = await getShopBySlug(params.slug);
  if (!shop) return { title: "Portfolio" };
  return {
    title: `Portfolio de ${shop.name} - Octavia Event`,
    description: `Découvrez les réalisations de ${shop.name}.`,
  };
}

export default async function PortfolioPage({ params }: { params: { slug: string } }) {
  const shop = await getShopBySlug(params.slug);
  if (!shop) return notFound();

  // 🔥 Récupération robuste du tableau d'images
  const imagesRaw = shop.profile?.images;
  const images: string[] = Array.isArray(imagesRaw)
    ? imagesRaw.filter((img): img is string => typeof img === "string")
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 md:p-8">
        <Link
          href={`/boutiques/${shop.slug}`}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4"
        >
          <ArrowLeft size={16} /> Retour à la boutique
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Portfolio de {shop.name}
        </h1>
        {shop.profile?.portfolio && (
          <p className="text-gray-600 dark:text-gray-300 mt-1">{shop.profile.portfolio}</p>
        )}

        <div className="mt-6">
          {images.length === 0 ? (
            <div className="text-center py-12">
              <ImageOff className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Aucune image dans le portfolio.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <img
                    src={url}
                    alt={`${shop.name} - ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}