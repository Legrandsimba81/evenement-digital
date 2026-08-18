// app/(public)/boutiques/[slug]/reserver/page.tsx
import { getShopBySlug } from "@/actions/shop-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReservationForm from "@/components/shops/ReservationForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const shop = await getShopBySlug(params.slug);
  if (!shop) return { title: "Réservation" };
  return {
    title: `Réserver ${shop.name} - Octavia Event`,
    description: `Faites une réservation chez ${shop.name} pour votre événement.`,
  };
}

export default async function ReserverPage({ params }: { params: { slug: string } }) {
  const shop = await getShopBySlug(params.slug);
  if (!shop) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 md:p-8">
        <Link
          href={`/boutiques/${shop.slug}`}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4"
        >
          ← Retour à la boutique
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Réserver {shop.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {shop.city && `📍 ${shop.city}`} {shop.profile?.priceRange && `• ${shop.profile.priceRange}`}
        </p>

        <div className="mt-6">
          <ReservationForm shopSlug={shop.slug} />
        </div>
      </div>
    </div>
  );
}