// app/(protected)/dashboard/shops/[slug]/portfolio/page.tsx
import { getShopBySlug } from "@/actions/shop-actions";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PortfolioManager from "@/components/shops/PortfolioManager";

export const dynamic = "force-dynamic";

export default async function DashboardPortfolioPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const shop = await getShopBySlug(params.slug);
  if (!shop) return notFound();

  if (shop.userId !== session.user.id && session.user.role !== "ADMIN") {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Vous n'êtes pas autorisé.</p>
      </div>
    );
  }

  const profileImages = Array.isArray(shop.profile?.images)
    ? (shop.profile.images as any[]).filter((img: any): img is string => typeof img === "string")
    : [];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Portfolio - {shop.name}
        </h1>
        <Link
          href={`/dashboard/shops/${shop.slug}`}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} /> Retour
        </Link>
      </div>
      <PortfolioManager shopSlug={shop.slug} initialImages={profileImages} />
    </div>
  );
}