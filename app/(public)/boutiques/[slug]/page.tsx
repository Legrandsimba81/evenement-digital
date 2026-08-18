// app/(public)/boutiques/[slug]/page.tsx
import { getShopBySlug } from "@/actions/shop-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Phone, Globe, Star, ArrowLeft, BadgeCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const shop = await getShopBySlug(params.slug);
    if (!shop) return { title: "Boutique introuvable" };
    return {
      title: shop.name,
      description: shop.description || `Découvrez ${shop.name} sur Octavia Event.`,
      openGraph: {
        title: shop.name,
        description: shop.description || "",
        images: shop.logo ? [{ url: shop.logo }] : [],
      },
    };
  } catch (error) {
    console.error("[generateMetadata] Erreur:", error);
    return { title: "Erreur de chargement" };
  }
}

export default async function BoutiquePage({ params }: { params: { slug: string } }) {
  try {
    console.log(`[BoutiquePage] Début du chargement pour slug: "${params.slug}"`);
    const shop = await getShopBySlug(params.slug);
    console.log(`[BoutiquePage] Résultat de getShopBySlug:`, shop ? 'boutique trouvée' : 'null');

    if (!shop) {
      console.log(`[BoutiquePage] Boutique non trouvée, appel à notFound()`);
      return notFound();
    }

    // Vérification supplémentaire : si le profil est null, on crée un objet vide pour éviter les erreurs
    const profile = shop.profile || { tags: [], images: [] };
    const avgRating = shop.avgRating !== null ? shop.avgRating.toFixed(1) : "N/A";
    const reviews = shop.reviews || [];
    const tags = Array.isArray(profile.tags) ? profile.tags : [];
    const profileImages = Array.isArray(profile.images) ? profile.images : [];

    console.log(`[BoutiquePage] Données préparées: tags=${tags.length}, images=${profileImages.length}`);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4">
        {/* ... reste du JSX inchangé ... */}
        {/* Utiliser profileImages et tags comme avant */}
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
          {/* ... contenu ... */}
        </div>
      </div>
    );
  } catch (error) {
    // En développement, on affiche l'erreur pour faciliter le débogage
    const isDev = process.env.NODE_ENV === 'development';
    console.error("[BoutiquePage] ERREUR CATASTROPHIQUE:", error);
    
    if (isDev) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">🚨 Erreur de chargement</h1>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap">
              {error instanceof Error ? error.message : String(error)}
              {"\n\nStack trace:"}
              {error instanceof Error ? error.stack : 'Pas de stack disponible'}
            </pre>
            <Link href="/boutiques" className="mt-4 inline-block text-blue-600 hover:underline">
              Retour à la liste
            </Link>
          </div>
        </div>
      );
    }

    // En production, affichage générique
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Oups !</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Impossible de charger cette boutique. Nous avons été notifiés.
          </p>
          <Link href="/boutiques" className="mt-4 inline-block text-blue-600 hover:underline">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }
}