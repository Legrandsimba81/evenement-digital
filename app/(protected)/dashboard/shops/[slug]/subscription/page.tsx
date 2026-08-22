// app/(protected)/dashboard/shops/[slug]/subscription/page.tsx
import { getShopBySlug } from "@/actions/shop-actions";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Shield, Zap, CreditCard, Smartphone } from "lucide-react";
import SubscriptionCard from "@/components/shops/SubscriptionCard";

export const dynamic = "force-dynamic";

export default async function ShopSubscriptionPage({
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

  const plans = [
    {
      id: "basic",
      name: "Essentiel",
      price: 5,
      currency: "USD",
      period: "mois",
      features: [
        "Badge de vérification",
        "Mise en avant dans les recherches",
        "Support prioritaire par email",
        "Statistiques de base",
      ],
      popular: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: 10,
      currency: "USD",
      period: "mois",
      features: [
        "Badge de vérification premium",
        "Mise en avant en première page",
        "Support prioritaire 24/7",
        "Statistiques avancées",
        "Accès aux leads qualifiés",
        "Invitation à des événements exclusifs",
      ],
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <Link
          href={`/dashboard/shops/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-6 transition"
        >
          <ArrowLeft size={16} /> Retour à la boutique
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield size={24} className="text-primary-500" />
            Abonnement et vérification – {shop.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {shop.isVerified
              ? "Votre boutique est actuellement vérifiée. Gérez votre abonnement ci-dessous."
              : "Souscrivez à un abonnement pour obtenir le badge de vérification et débloquer des fonctionnalités exclusives."}
          </p>

          {shop.isVerified && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
              <CheckCircle className="text-green-600 dark:text-green-400 w-5 h-5" />
              <span className="text-sm text-green-700 dark:text-green-300">
                ✅ Boutique vérifiée – Abonnement actif jusqu’au {new Date().toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <SubscriptionCard key={plan.id} shopSlug={slug} plan={plan} isVerified={shop.isVerified} />
            ))}
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard size={18} />
              Moyens de paiement acceptés
            </h2>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm">Carte bancaire (Visa, Mastercard)</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm">Mobile Money (Airtel, Orange, Vodacom)</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Les paiements sont sécurisés et traités par PawaPay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}