import Link from "next/link";
import {
  FileText,
  Award,
  Wallet,
  CheckCircle2,
  Users,
  Send,
  ShieldCheck,
  ArrowRight,
  Trophy,
  PenTool,
} from "lucide-react";

const rules = [
  {
    icon: PenTool,
    title: "1. Rédaction de l'article",
    description:
      "Rédigez un article original et captivant. Le sujet doit respecter la charte de notre plateforme. Chaque candidat ne peut soumettre qu'une seule candidature par session.",
    action: { label: "Soumettre mon article", href: "/concours/nouveau" },
  },
  {
    icon: Users,
    title: "2. Limite des participants",
    description:
      "Le concours est strictement limité à 10 candidats par session. Dès que la limite est atteinte, les inscriptions sont fermées jusqu'au prochain cycle.",
    action: { label: "Voir les candidats", href: "/concours" },
  },
  {
    icon: Award,
    title: "3. Gain initial à l'approbation",
    description:
      "Une fois votre article vérifié et approuvé par l'équipe de modération, une prime de bienvenue de 2$ est automatiquement créditée sur votre cagnotte candidat.",
    action: { label: "Consulter la liste", href: "/concours" },
  },
  {
    icon: Trophy,
    title: "4. Palier des 1000 Likes & Prix",
    description:
      "Partagez votre publication ! Les candidats atteignant 1000 likes concourent pour les grands prix : 50$ pour le 1er rang, 20$ pour le 2e rang et 10$ pour le 3e rang.",
    action: { label: "Participer", href: "/concours/nouveau" },
  },
  {
    icon: Wallet,
    title: "5. Modes de Paiement Supportés",
    description:
      "Les récompenses sont versées exclusivement via Mobile Money : Airtel Money et Vodacom M-Pesa. Assurez-vous d'utiliser un numéro valide avec le nom exact enregistré sur la SIM.",
    action: { label: "S'inscrire", href: "/concours/nouveau" },
  },
  {
    icon: Send,
    title: "6. Retrait des prix",
    description:
      "Avant de soumettre votre article, vous indiquez votre numéro de réception et le nom titulaire de la carte SIM. La demande de paiement est instantanément envoyée à l'administration.",
    action: { label: "Lire la suite", href: "#faq" },
  },
];

export default function ConcoursRulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 md:py-16 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full mb-4 text-sm font-semibold">
            <ShieldCheck className="w-4 h-4" /> Règlement officiel
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Règles & Conditions du Concours
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez le fonctionnement du concours de rédaction, les conditions d'attribution des prix et les modalités de paiement via Airtel et Vodacom.
          </p>
        </div>

        {/* Grille des sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rules.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02] hover:bg-white dark:hover:bg-gray-900 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {section.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {section.description}
                    </p>
                    <Link
                      href={section.action.href}
                      className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      {section.action.label}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Appel à l'action */}
        <div className="mt-12 text-center">
          <Link
            href="/concours/nouveau"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:scale-105 transition-all duration-200"
          >
            <PenTool className="w-5 h-5" />
            Déposer mon article maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}