// app/(public)/boutiques/[slug]/portfolio/page.tsx
import { getShop } from "@/actions/shop-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function PortfolioPage({ params }: { params: { slug: string } }) {
  const shop = await getShop(params.slug);
  if (!shop) return notFound();

  // ✅ Filtrer les images pour ne garder que les chaînes de caractères
  const images = Array.isArray(shop.profile?.images)
    ? shop.profile.images.filter((img): img is string => typeof img === "string")
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href={`/boutiques/${shop.slug}`}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 mb-6"
        >
          <ArrowLeft size={18} /> Retour à la boutique
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{shop.name}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Portfolio</p>

        {images.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            Ce prestataire n'a pas encore ajouté de photos.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
                <img src={img} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}