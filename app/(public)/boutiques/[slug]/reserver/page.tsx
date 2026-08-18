// app/(public)/boutiques/[slug]/reserver/page.tsx
import { getShopBySlug } from "@/actions/shop-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import ReservationForm from "@/components/shops/ReservationForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) return { title: "Réservation" };
  return {
    title: `Réserver ${shop.name} - Octavia Event`,
    description: `Faites une réservation chez ${shop.name} pour votre événement.`,
  };
}

export default async function ReserverPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/boutiques/${shop.slug}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-4 transition"
        >
          <ArrowLeft size={16} /> Retour à la boutique
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Réserver {shop.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            {shop.city && (
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {shop.city}
              </span>
            )}
            {shop.profile?.priceRange && (
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {shop.profile.priceRange}
              </span>
            )}
          </div>

          <div className="mt-6">
            <ReservationForm shopSlug={shop.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}