// app/(protected)/dashboard/shops/[slug]/subscription/manage/page.tsx
import { getShopBySlug } from "@/actions/shop-actions";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Calendar, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import SubscriptionManagement from "@/components/shops/SubscriptionManagement";

export const dynamic = "force-dynamic";

export default async function ManageSubscriptionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const shop = await getShopBySlug(slug);
  if (!shop) return notFound();
  if (shop.userId !== session.user.id && session.user.role !== "ADMIN") {
    return <div className="p-6 text-center text-red-500">Non autorisé</div>;
  }

  // Récupérer les transactions d'abonnement pour cette boutique
  const subscriptionTransactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      type: "subscription",
      status: "completed",
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Déterminer le plan actif (si la boutique est vérifiée, on suppose qu'elle a un abonnement actif)
  // Pour simplifier, on prend la dernière transaction réussie
  const lastSubscription = subscriptionTransactions.length > 0 ? subscriptionTransactions[0] : null;

  // Extraire le nom du plan depuis la description
  const planName = lastSubscription?.description?.match(/Abonnement ([^-]+)/)?.[1] || "Inconnu";
  const expiryDate = lastSubscription?.createdAt
    ? new Date(lastSubscription.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 jours
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/dashboard/shops/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-6 transition"
        >
          <ArrowLeft size={16} /> Retour à la boutique
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield size={24} className="text-primary-500" />
            Gestion de l'abonnement
          </h1>

          {/* Statut actuel */}
          <div className="mt-6 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Statut</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {shop.isVerified ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Actif
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Inactif
                    </>
                  )}
                </p>
              </div>
              {shop.isVerified && lastSubscription && (
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{planName}</p>
                </div>
              )}
            </div>
            {shop.isVerified && expiryDate && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                Prochaine échéance : {expiryDate.toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>

          {/* Composant client pour la gestion (annulation) */}
          <SubscriptionManagement shopSlug={slug} isVerified={shop.isVerified} />

          {/* Historique des paiements */}
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Historique des paiements
            </h2>
            {subscriptionTransactions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Aucun paiement d'abonnement trouvé.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Date</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Montant</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Méthode</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                          {tx.createdAt.toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">
                          {tx.amount} {tx.currency}
                        </td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                          {tx.operator || tx.provider || 'N/A'}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              tx.status === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            }`}
                          >
                            {tx.status === 'completed' ? 'Payé' : 'En attente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}