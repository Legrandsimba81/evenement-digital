import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import DeleteShopButton from "@/components/shops/DeleteShopButton";

export default async function DashboardShopsPage() {
  const session = await auth();
  if (!session?.user) return <div>Connectez-vous</div>;

  const shops = await prisma.shop.findMany({
    where: { userId: session.user.id },
    include: { category: true, profile: true, reviews: { select: { id: true } } },
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes boutiques</h1>
        <Link href="/dashboard/shops/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus size={18} /> Créer une boutique
        </Link>
      </div>
      {shops.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Vous n'avez pas encore de boutique.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shops.map((shop) => (
            <div key={shop.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                {shop.logo && <img src={shop.logo} alt={shop.name} className="w-16 h-16 rounded-full object-cover" />}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{shop.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{shop.category?.name} • {shop.city || "Ville non spécifiée"}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{shop.reviews.length} avis</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/shops/${shop.slug}/edit`} className="text-yellow-500 hover:text-yellow-600">
                    <Edit size={18} />
                  </Link>
                  <DeleteShopButton slug={shop.slug} name={shop.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}