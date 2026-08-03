"use client";

import { useState } from "react";
import { Check, Gift, Heart, Trophy, Music, Sparkles, Calendar, Users, Star, X } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import PaymentForm from "@/components/PaymentForm";
import { useRouter } from "next/navigation";

// Définition des plans
const plans = [
  // Plans gratuits pour chaque type avec 5 invités
  {
    id: "anniv-gratuit",
    category: "gratuit",
    name: "Anniversaire (5 invités)",
    price: 0,
    currency: "$",
    icon: Gift,
    color: "emerald",
    description: "Testez notre plateforme avec une invitation d'anniversaire pour 5 invités.",
    features: ["Invitation personnalisée", "Gestion de 5 invités", "QR code d'accès", "Téléchargement de l'invitation"],
    eventType: "ANNIVERSAIRE",
  },
  {
    id: "soutenance-gratuit",
    category: "gratuit",
    name: "Soutenance (5 invités)",
    price: 0,
    currency: "$",
    icon: Trophy,
    color: "emerald",
    description: "Testez notre plateforme avec une invitation de soutenance pour 5 invités.",
    features: ["Invitation personnalisée", "Gestion de 5 invités", "QR code d'accès", "Téléchargement de l'invitation"],
    eventType: "SOUTENANCE",
  },
  {
    id: "mariage-gratuit",
    category: "gratuit",
    name: "Mariage (5 invités)",
    price: 0,
    currency: "$",
    icon: Heart,
    color: "emerald",
    description: "Testez notre plateforme avec une invitation de mariage pour 5 invités.",
    features: ["Invitation personnalisée", "Gestion de 5 invités", "QR code d'accès", "Téléchargement de l'invitation"],
    eventType: "MARIAGE",
  },
  {
    id: "concert-gratuit",
    category: "gratuit",
    name: "Concert (5 invités)",
    price: 0,
    currency: "$",
    icon: Music,
    color: "emerald",
    description: "Testez notre plateforme avec un billet de concert pour 5 invités.",
    features: ["Billet personnalisé", "Gestion de 5 billets", "QR code d'accès", "Téléchargement du billet"],
    eventType: "CONCERT",
  },
  {
    id: "autre-gratuit",
    category: "gratuit",
    name: "Autre événement (5 invités)",
    price: 0,
    currency: "$",
    icon: Calendar,
    color: "emerald",
    description: "Testez notre plateforme avec un autre type d'événement pour 5 invités.",
    features: ["Invitation personnalisée", "Gestion de 5 invités", "QR code d'accès", "Téléchargement de l'invitation"],
    eventType: "AUTRE",
  },
  // Plans payants existants
  {
    id: "anniv-50",
    category: "classique",
    name: "Anniversaire (50 invités)",
    price: 5,
    currency: "$",
    icon: Gift,
    color: "pink",
    description: "Idéal pour un anniversaire avec une liste d'invités moyenne.",
    features: ["Invitation personnalisée", "Gestion de 50 invités", "QR code d'accès", "Téléchargement", "Messages des invités"],
    eventType: "ANNIVERSAIRE",
  },
  {
    id: "anniv-illimite",
    category: "classique",
    name: "Anniversaire (Illimité)",
    price: 10,
    currency: "$",
    icon: Gift,
    color: "pink",
    description: "Organisez un anniversaire sans limite d'invités.",
    features: ["Invitation personnalisée", "Invités illimités", "QR code d'accès", "Téléchargement", "Messages", "Statistiques"],
    eventType: "ANNIVERSAIRE",
  },
  {
    id: "soutenance-50",
    category: "classique",
    name: "Soutenance (50 invités)",
    price: 5,
    currency: "$",
    icon: Trophy,
    color: "purple",
    description: "Invitez vos professeurs et proches à votre soutenance.",
    features: ["Invitation personnalisée", "Gestion de 50 invités", "QR code d'accès", "Téléchargement", "Sujet de thèse"],
    eventType: "SOUTENANCE",
  },
  {
    id: "soutenance-illimite",
    category: "classique",
    name: "Soutenance (Illimité)",
    price: 10,
    currency: "$",
    icon: Trophy,
    color: "purple",
    description: "Soutenez-vous sans limite d'invités.",
    features: ["Invitation personnalisée", "Invités illimités", "QR code d'accès", "Téléchargement", "Sujet de thèse", "Statistiques"],
    eventType: "SOUTENANCE",
  },
  {
    id: "mariage",
    category: "premium",
    name: "Mariage (Illimité)",
    price: 30,
    currency: "$",
    icon: Heart,
    color: "rose",
    description: "Une invitation élégante et complète pour votre mariage.",
    features: ["Invitation personnalisée", "Invités illimités", "QR code d'accès", "Téléchargement", "Messages d'amour", "Thèmes romantiques", "Statistiques"],
    eventType: "MARIAGE",
  },
  {
    id: "concert",
    category: "premium",
    name: "Concert (Illimité)",
    price: 20,
    currency: "$",
    icon: Music,
    color: "orange",
    description: "Billets numériques pour votre concert ou festival.",
    features: ["Billets personnalisés", "Invités illimités", "QR code d'accès", "Téléchargement", "Niveaux (VIP, Standard)", "Statistiques de vente", "Contrôle d'accès"],
    eventType: "CONCERT",
  },
  {
    id: "autre",
    category: "premium",
    name: "Autre événement (Illimité)",
    price: 20,
    currency: "$",
    icon: Calendar,
    color: "blue",
    description: "Personnalisez votre événement sur mesure.",
    features: ["Invitation personnalisée", "Invités illimités", "QR code d'accès", "Téléchargement", "Messages", "Statistiques", "Thèmes variés"],
    eventType: "AUTRE",
  },
  // Abonnements
  {
    id: "abonnement-3mois",
    category: "abonnement",
    name: "Abonnement 3 mois",
    price: 50,
    currency: "$",
    icon: Star,
    color: "gold",
    description: "Créez jusqu'à 3 événements de chaque catégorie pendant 3 mois.",
    features: [
      "3 événements Anniversaire",
      "3 événements Soutenance",
      "3 événements Mariage",
      "3 événements Concert",
      "3 événements Autre",
      "Invités illimités",
      "Toutes les fonctionnalités",
    ],
    eventType: "ABONNEMENT",
  },
  {
    id: "abonnement-6mois",
    category: "abonnement",
    name: "Abonnement 6 mois",
    price: 90,
    currency: "$",
    icon: Star,
    color: "gold",
    description: "Créez jusqu'à 5 événements de chaque catégorie pendant 6 mois.",
    features: [
      "5 événements Anniversaire",
      "5 événements Soutenance",
      "5 événements Mariage",
      "5 événements Concert",
      "5 événements Autre",
      "Invités illimités",
      "Toutes les fonctionnalités",
    ],
    eventType: "ABONNEMENT",
  },
  {
    id: "abonnement-1an",
    category: "abonnement",
    name: "Abonnement 1 an",
    price: 150,
    currency: "$",
    icon: Star,
    color: "gold",
    description: "Créez jusqu'à 10 événements de chaque catégorie pendant 1 an.",
    features: [
      "10 événements Anniversaire",
      "10 événements Soutenance",
      "10 événements Mariage",
      "10 événements Concert",
      "10 événements Autre",
      "Invités illimités",
      "Toutes les fonctionnalités",
    ],
    eventType: "ABONNEMENT",
  },
];

const colorClasses = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200",
    text: "text-emerald-700",
    hover: "hover:bg-emerald-100",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    btn: "bg-emerald-600 hover:bg-emerald-700",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-950/40",
    border: "border-pink-200",
    text: "text-pink-700",
    hover: "hover:bg-pink-100",
    iconBg: "bg-pink-100",
    iconText: "text-pink-600",
    btn: "bg-pink-600 hover:bg-pink-700",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200",
    text: "text-purple-700",
    hover: "hover:bg-purple-100",
    iconBg: "bg-purple-100",
    iconText: "text-purple-600",
    btn: "bg-purple-600 hover:bg-purple-700",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200",
    text: "text-rose-700",
    hover: "hover:bg-rose-100",
    iconBg: "bg-rose-100",
    iconText: "text-rose-600",
    btn: "bg-rose-600 hover:bg-rose-700",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-200",
    text: "text-orange-700",
    hover: "hover:bg-orange-100",
    iconBg: "bg-orange-100",
    iconText: "text-orange-600",
    btn: "bg-orange-600 hover:bg-orange-700",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200",
    text: "text-blue-700",
    hover: "hover:bg-blue-100",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    btn: "bg-blue-600 hover:bg-blue-700",
  },
  gold: {
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    border: "border-yellow-200",
    text: "text-yellow-700",
    hover: "hover:bg-yellow-100",
    iconBg: "bg-yellow-100",
    iconText: "text-yellow-600",
    btn: "bg-yellow-600 hover:bg-yellow-700",
  },
};

export default function PricingPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleChoosePlan = (plan: typeof plans[0]) => {
    // Si le plan est gratuit, rediriger directement vers la page de création de l'événement
    if (plan.price === 0 && plan.eventType && plan.eventType !== "ABONNEMENT") {
      router.push(`/dashboard/event/new/${plan.eventType}`);
      return;
    }

    // Sinon, pour les plans payants ou abonnements, ouvrir la modale de paiement
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPlan(null);
  };

  const handlePaymentSuccess = (plan: typeof plans[0]) => {
    closePaymentModal();
    // Après paiement réussi, rediriger vers la page de création
    if (plan.eventType && plan.eventType !== "ABONNEMENT") {
      router.push(`/dashboard/event/new/${plan.eventType}`);
    } else {
      router.push("/dashboard");
    }
  };

  // Regrouper par catégorie
  const groupedPlans = {
    gratuit: plans.filter((p) => p.category === "gratuit"),
    classique: plans.filter((p) => p.category === "classique"),
    premium: plans.filter((p) => p.category === "premium"),
    abonnement: plans.filter((p) => p.category === "abonnement"),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          {/* <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div> */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Nos tarifs
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choisissez le forfait qui correspond à votre événement. Paiement unique ou abonnement flexible.
          </p>
        </div>

        

        {/* Classique */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Événements classiques
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {groupedPlans.classique.map((plan) => {
              const Icon = plan.icon;
              const colors = colorClasses[plan.color as keyof typeof colorClasses];
              return (
                <div
                  key={plan.id}
                  className={`bg-white dark:bg-gray-900 rounded-2xl shadow-lg border ${colors.border} overflow-hidden transition hover:shadow-xl flex flex-col`}
                >
                  <div className={`p-6 ${colors.bg} ${colors.border} border-b`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full ${colors.iconBg} ${colors.iconText}`}>
                        <Icon size={24} />
                      </div>
                      <h3 className={`text-xl font-bold ${colors.text}`}>{plan.name}</h3>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {plan.price}
                        {plan.currency}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/ événement</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{plan.description}</p>
                  </div>
                  <div className="p-6 flex-1">
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check size={16} className="text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => handleChoosePlan(plan)}
                      className={`w-full py-2 px-4 rounded-xl text-white font-medium transition ${colors.btn}`}
                    >
                      Choisir {plan.name}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Premium */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-rose-500" />
            Événements premium
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedPlans.premium.map((plan) => {
              const Icon = plan.icon;
              const colors = colorClasses[plan.color as keyof typeof colorClasses];
              return (
                <div
                  key={plan.id}
                  className={`bg-white dark:bg-gray-900 rounded-2xl shadow-lg border ${colors.border} overflow-hidden transition hover:shadow-xl flex flex-col`}
                >
                  <div className={`p-6 ${colors.bg} ${colors.border} border-b`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full ${colors.iconBg} ${colors.iconText}`}>
                        <Icon size={24} />
                      </div>
                      <h3 className={`text-xl font-bold ${colors.text}`}>{plan.name}</h3>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {plan.price}
                        {plan.currency}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/ événement</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{plan.description}</p>
                  </div>
                  <div className="p-6 flex-1">
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check size={16} className="text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => handleChoosePlan(plan)}
                      className={`w-full py-2 px-4 rounded-xl text-white font-medium transition ${colors.btn}`}
                    >
                      Choisir {plan.name}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Abonnement */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-500" />
            Abonnement flexible
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedPlans.abonnement.map((plan) => {
              const Icon = plan.icon;
              const colors = colorClasses[plan.color as keyof typeof colorClasses];
              return (
                <div
                  key={plan.id}
                  className={`bg-white dark:bg-gray-900 rounded-2xl shadow-lg border ${colors.border} overflow-hidden transition hover:shadow-xl flex flex-col`}
                >
                  <div className={`p-6 ${colors.bg} ${colors.border} border-b`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full ${colors.iconBg} ${colors.iconText}`}>
                        <Icon size={24} />
                      </div>
                      <h3 className={`text-xl font-bold ${colors.text}`}>{plan.name}</h3>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {plan.price}
                        {plan.currency}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        / {plan.id.includes("3mois") ? "3 mois" : plan.id.includes("6mois") ? "6 mois" : "1 an"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{plan.description}</p>
                  </div>
                  <div className="p-6 flex-1">
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check size={16} className="text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => handleChoosePlan(plan)}
                      className={`w-full py-2 px-4 rounded-xl text-white font-medium transition ${colors.btn}`}
                    >
                      Choisir {plan.name}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Offre gratuite */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-500" />
            Offre découverte
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {groupedPlans.gratuit.map((plan) => {
              const Icon = plan.icon;
              const colors = colorClasses[plan.color as keyof typeof colorClasses];
              return (
                <div
                  key={plan.id}
                  className={`bg-white dark:bg-gray-900 rounded-2xl shadow-lg border ${colors.border} overflow-hidden transition hover:shadow-xl`}
                >
                  <div className={`p-6 ${colors.bg} ${colors.border} border-b`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full ${colors.iconBg} ${colors.iconText}`}>
                        <Icon size={24} />
                      </div>
                      <h3 className={`text-lg font-bold ${colors.text}`}>{plan.name}</h3>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">Gratuit</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{plan.description}</p>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleChoosePlan(plan)}
                      className="w-full mt-4 py-2 px-4 rounded-xl text-white font-medium bg-emerald-600 hover:bg-emerald-700 transition"
                    >
                      Commencer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Besoin d’un forfait personnalisé pour un événement spécial ?
          </p>
          <a
            href="https://wa.me/243992598826"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition text-sm font-medium mt-4"
          >
            <SiWhatsapp size={20} />
            Contacter sur Whatsapp
          </a>
        </div>
      </div>

      {/* Modal de paiement */}
      {isPaymentModalOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Paiement pour "{selectedPlan.name}"
              </h3>
              <button
                onClick={closePaymentModal}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={24} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <PaymentForm plan={selectedPlan} onSuccess={handlePaymentSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}