import Link from "next/link";
import {
  Sparkles,
  PenTool,
  ArrowLeft,
  Calendar,
  Ticket,
  MessageSquare,
  BookOpen,
} from "lucide-react";

const topicIdeas = [
  {
    icon: Calendar,
    category: "Mariages & Événements Privés",
    title: "Comment simplifier l'organisation de son mariage avec Octavia Event",
    angle: "Mettre en avant la gestion fluide des invitations WhatsApp, la liste d'invités digitale et l'élimination des pertes de billets papier.",
  },
  {
    icon: Ticket,
    category: "Concerts, Soirées & Festivals",
    title: "Pourquoi les organisateurs de concerts adoptent la billetterie Octavia",
    angle: "Insister sur la rapidité de réservation, le paiement Mobile Money (Airtel/Vodacom) et le contrôle d'accès rapide à l'entrée.",
  },
  {
    icon: MessageSquare,
    category: "Conférences & Formations",
    title: "Remplir sa salle de conférence en 48 heures grâce au marketing d'Octavia",
    angle: "Expliquer l'impact des invitations automatisées envoyées directement dans les conversations WhatsApp des participants.",
  },
];

export default function ConcoursExamplesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 py-12 px-4 md:py-16 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation retour */}
        <Link
          href="/concours/regles"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Retour aux règles
        </Link>

        {/* En-tête */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full mb-4 text-sm font-semibold">
            <Sparkles className="w-4 h-4" /> Guide d'inspiration
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
            Exemples de Sujets & Structure d'Article
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mt-3 max-w-2xl leading-relaxed">
            Pour réussir votre article, l'objectif est de convaincre les lecteurs d'utiliser <strong>Octavia Event</strong> pour créer leurs événements ou acheter leurs billets.
          </p>
        </div>

        {/* Section 1 : Idées de Sujets */}
        <div className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BookOpen className="text-blue-600" size={24} /> Idées de Sujets Populaires
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topicIdeas.map((idea, idx) => {
              const Icon = idea.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl w-fit mb-4">
                      <Icon size={24} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-2">
                      {idea.category}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 leading-snug">
                      "{idea.title}"
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {idea.angle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2 : Exemple de Structure d'Article */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-md mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Exemple de Plan de Rédaction Réussi
          </h2>

          <div className="space-y-4 text-sm md:text-base text-gray-700 dark:text-gray-300">
            <div className="p-5 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border-1 border-blue-600">
              <h4 className="font-bold text-gray-900 dark:text-white text-base md:text-lg mb-1">1. Titre accrocheur</h4>
              <p className="italic text-gray-600 dark:text-gray-400">Exemple : "Pourquoi vous ne devez plus organiser vos événements sans Octavia Event."</p>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border-1 border-indigo-600">
              <h4 className="font-bold text-gray-900 dark:text-white text-base md:text-lg mb-1">2. Le Problème (L'Accroche)</h4>
              <p>Parlez des difficultés courantes : pertes de billets papier, gestion lourde des invités, réticence sur les paiements non sécurisés.</p>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border-1 border-emerald-600">
              <h4 className="font-bold text-gray-900 dark:text-white text-base md:text-lg mb-1">3. La Solution (Octavia Event)</h4>
              <p>Présentez les fonctionnalités clés d'Octavia Event : billetterie instantanée, invitations automatisées via WhatsApp, encaissement Airtel Money & Vodacom M-Pesa facile.</p>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border-1 border-amber-600">
              <h4 className="font-bold text-gray-900 dark:text-white text-base md:text-lg mb-1">4. Appel à l'action (Conclusion)</h4>
              <p>Encouragez explicitement vos lecteurs à créer leur premier événement sur Octavia Event dès aujourd'hui.</p>
            </div>
          </div>
        </div>

        {/* Bouton d'action */}
        <div className="text-center">
          <Link
            href="/concours/nouveau"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:scale-105 transition-all duration-200"
          >
            <PenTool size={20} />
            je suis prêt à rédiger mon article
          </Link>
        </div>

      </div>
    </div>
  );
}