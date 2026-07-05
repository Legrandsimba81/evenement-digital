import { Check, Gift, Heart, Trophy, Music } from "lucide-react";
import Link from "next/link";
import { SiWhatsapp } from "react-icons/si";

const pricingPlans = [
    {
        id: "anniversaire",
        name: "Anniversaire",
        price: "5$",
        icon: Gift,
        color: "pink",
        description: "Créez une invitation numérique personnalisée pour un anniversaire.",
        features: [
            "Invitation personnalisée",
            "Gestion des invités",
            "QR code d'accès",
            "Téléchargement de l'invitation",
            "Messages des invités",
            "Statistiques de présence",
        ],
    },
    {
        id: "mariage",
        name: "Mariage",
        price: "15$",
        icon: Heart,
        color: "rose",
        description: "Une invitation élégante et complète pour votre mariage.",
        features: [
            "Invitation personnalisée",
            "Gestion des invités",
            "QR code d'accès",
            "Téléchargement de l'invitation",
            "Messages des invités",
            "Statistiques de présence",
            "Messages d'amour",
            "Thèmes romantiques",
        ],
    },
    {
        id: "soutenance",
        name: "Soutenance",
        price: "5$",
        icon: Trophy,
        color: "purple",
        description: "Invitez vos professeurs et proches à votre soutenance.",
        features: [
            "Invitation personnalisée",
            "Gestion des invités",
            "QR code d'accès",
            "Téléchargement de l'invitation",
            "Messages des invités",
            "Statistiques de présence",
            "Affichage du sujet de thèse",
        ],
    },
    {
        id: "concert",
        name: "Concert",
        price: "30$",
        icon: Music,
        color: "orange",
        description: "Billets numériques pour votre concert ou festival.",
        features: [
            "Billets personnalisés",
            "Gestion des billets",
            "QR code d'accès",
            "Téléchargement du billet",
            "Niveaux (VIP, Standard)",
            "Statistiques de vente",
            "Contrôle d'accès",
        ],
    },
];

const colorClasses = {
    pink: {
        bg: "bg-pink-50",
        border: "border-pink-200",
        text: "text-pink-700",
        hover: "hover:bg-pink-100",
        iconBg: "bg-pink-100",
        iconText: "text-pink-600",
    },
    rose: {
        bg: "bg-rose-50",
        border: "border-rose-200",
        text: "text-rose-700",
        hover: "hover:bg-rose-100",
        iconBg: "bg-rose-100",
        iconText: "text-rose-600",
    },
    purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-700",
        hover: "hover:bg-purple-100",
        iconBg: "bg-purple-100",
        iconText: "text-purple-600",
    },
    orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        hover: "hover:bg-orange-100",
        iconBg: "bg-orange-100",
        iconText: "text-orange-600",
    },
};

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Nos tarifs
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Créez des invitations professionnelles adaptées à vos événements.
                        Choisissez le forfait qui correspond à vos besoins.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pricingPlans.map((plan) => {
                        const Icon = plan.icon;
                        const colors = colorClasses[plan.color as keyof typeof colorClasses];

                        return (
                            <div
                                key={plan.id}
                                className={`bg-white dark:bg-gray-900 rounded-2xl shadow-lg border ${colors.border} overflow-hidden transition-transform hover:scale-105 flex flex-col`}
                            >
                                {/* En-tête */}
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
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/ événement</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                        {plan.description}
                                    </p>
                                </div>

                                {/* Corps */}
                                <div className="p-6 flex-1">
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <Check size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Footer */}
                                <div className="p-6 border-t border-gray-200 dark:border-gray-800">
                                    <Link
                                        href="/register"
                                        className={`w-full block text-center py-2 px-4 rounded-xl font-medium text-white transition ${colors.text.replace("text-", "bg-")} hover:opacity-90`}
                                    >
                                        Choisir {plan.name}
                                    </Link>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                                        Sans engagement, paiement unique
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Section FAQ / Contact */}
                <div className="mt-16 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Besoin d’un forfait personnalisé pour un événement spécial ?
                    </p>
                    <a
                        href="https://wa.me/243827733286"
                        target="_blank"
                        className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition text-sm font-medium"
                    >
                        <SiWhatsapp size={20} />
                        Contacter le support
                    </a>
                </div>
            </div>
        </div>
    );
}