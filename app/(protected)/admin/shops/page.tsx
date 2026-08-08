import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Eye, Edit, Trash2, Check, X, Store } from "lucide-react";
import DeleteShopButton from "@/components/shops/DeleteShopButton";

export const dynamic = "force-dynamic";

export default async function AdminShopsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const shops = await prisma.shop.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      category: { select: { name: true } },
    },
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Store size={24} className="text-blue-500" />
            Gestion des boutiques
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Liste complète des boutiques et prestataires inscrits sur la plateforme.
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {shops.length} boutique{shops.length > 1 ? "s" : ""}
        </div>
      </div>

      {shops.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">Aucune boutique pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Boutique</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Propriétaire</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Catégorie</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Ville</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Statut</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Créé le</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop) => (
                  <tr key={shop.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {shop.logo ? (
                          <img src={shop.logo} alt={shop.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs font-bold">
                            {shop.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">{shop.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white">{shop.user?.name || "Anonyme"}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{shop.user?.email || ""}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                        {shop.category?.name || "Non catégorisé"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {shop.city || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        shop.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}>
                        {shop.isActive ? <Check size={12} /> : <X size={12} />}
                        {shop.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(shop.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/boutiques/${shop.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-blue-500 hover:text-blue-700"
                          title="Voir la boutique"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/dashboard/shops/${shop.slug}/edit`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-yellow-500 hover:text-yellow-700"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </Link>
                        <DeleteShopButton slug={shop.slug} name={shop.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}