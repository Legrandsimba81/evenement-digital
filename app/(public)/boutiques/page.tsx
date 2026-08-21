// app/(public)/boutiques/page.tsx
import AlgoliaSearch from "@/components/shops/AlgoliaSearch";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Boutiques et prestataires - Octavia Event",
  description: "Trouvez les meilleurs prestataires pour votre événement en RDC.",
};

export default function BoutiquesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Titre et description masqués sur mobile (taille < md) */}
        <div className="hidden md:block">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Prestataires événementiels
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Trouvez les meilleurs professionnels pour votre événement en RDC.
          </p>
        </div>

        {/* Composant de recherche (gère le sticky et le tiroir mobile) */}
        <AlgoliaSearch />
      </div>
    </div>
  );
}