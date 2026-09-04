// app/(protected)/dashboard/shops/[slug]/portfolio/page.tsx
import { getShopBySlug } from "@/actions/shop-actions";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Image as ImageIcon, ExternalLink, ShieldAlert } from "lucide-react";
import PortfolioManagerWithUpload from "@/components/shops/PortfolioManagerWithUpload";

export const dynamic = "force-dynamic";

export default async function DashboardPortfolioPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const shop = await getShopBySlug(slug);
  if (!shop) return notFound();

  if (shop.userId !== session.user.id && session.user.role !== "ADMIN") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Accès non autorisé</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
          Vous n'avez pas les permissions nécessaires pour gérer le portfolio de cette boutique.
        </p>
        <Link
          href="/dashboard/shops"
          className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium transition hover:opacity-90"
        >
          Retour à mes boutiques
        </Link>
      </div>
    );
  }

  const images = Array.isArray(shop.profile?.images) ? shop.profile.images : [];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* En-tête de navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <Link
            href={`/dashboard/shops/${shop.slug}`}
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition mb-2"
          >
            <ArrowLeft size={14} /> Retour à la gestion de la boutique
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Portfolio
            </h1>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/50 text-primary-500 dark:text-primary-500 border border-blue-200 dark:border-blue-800/50">
              {shop.name}
            </span>
          </div>
        </div>

        <Link
          href={`/shops/${shop.slug}`}
          target="_blank"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition shadow-sm"
        >
          <span>Voir la vitrine publique</span>
          <ExternalLink size={14} />
        </Link>
      </div>

      {/* Bannière d'incitation (Call To Action) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-100 border border-white/20">
            <Sparkles size={14} className="text-amber-300" />
            <span>Multipliez vos opportunités</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold leading-tight">
            Mettez en valeur votre savoir-faire avec de belles photos !
          </h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Les boutiques avec un portfolio riche et récent attirent jusqu'à <strong className="text-white font-semibold">3x plus de contacts WhatsApp</strong>. Montrez vos plus belles réalisations pour rassurer vos clients et faire décoller vos commandes.
          </p>
        </div>
      </div>

      {/* Résumé du Portfolio */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <ImageIcon size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Galerie de photos</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {images.length > 0
                ? `${images.length} réalisation(s) publiée(s)`
                : "Aucune photo publiée pour le moment"}
            </p>
          </div>
        </div>
      </div>

      {/* Composant d'Upload et de Gestion */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <PortfolioManagerWithUpload shopSlug={shop.slug} initialImages={images} />
      </div>
    </div>
  );
}