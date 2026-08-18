// app/(public)/debug-shop/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DebugShopPage({ params }: { params: { slug: string } }) {
  try {
    const shop = await prisma.shop.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        profile: true,
        reviews: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!shop) return notFound();

    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🔍 Données brutes de la boutique</h1>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
          {JSON.stringify(shop, (key, value) => {
            if (key === 'password') return '***';
            return value;
          }, 2)}
        </pre>
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Profil (normalisé)</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm mt-2">
            {JSON.stringify(shop.profile, null, 2)}
          </pre>
        </div>
        <Link href={`/boutiques/${params.slug}`} className="mt-4 inline-block text-blue-600 hover:underline">
          Retour à la boutique
        </Link>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Erreur</h1>
        <pre className="bg-red-50 p-4 rounded-lg overflow-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}