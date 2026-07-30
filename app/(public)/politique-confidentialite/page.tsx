import Link from "next/link";
import {
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  Mail,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 md:py-16 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Politique de confidentialité
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comment Octavia Event protège et utilise vos données personnelles.
          </p>
        </div>

        {/* Contenu */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Collecte des données
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Nous collectons les informations que vous nous fournissez directement lors de la création de votre compte (nom, email, téléphone) et lors de l'utilisation de nos services (événements, invités, messages). Nous collectons également des données d'utilisation anonymisées pour améliorer nos services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Utilisation des données
            </h2>
            <ul className="mt-4 list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Gérer votre compte et vos événements.</li>
              <li>Personnaliser votre expérience et vous proposer des fonctionnalités adaptées.</li>
              <li>Vous envoyer des notifications importantes (confirmation d'inscription, rappels d'événements).</li>
              <li>Analyser l'utilisation du site pour l'améliorer.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Partage des données
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Nous ne partageons jamais vos données personnelles avec des tiers, sauf si vous nous y autorisez expressément ou si nous y sommes contraints par la loi. Les données liées à vos événements et invités sont strictement confidentielles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Vos droits
            </h2>
            <div className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Accès :</strong> savoir quelles données sont traitées.</li>
                <li><strong>Rectification :</strong> corriger vos données inexactes.</li>
                <li><strong>Suppression :</strong> demander l'effacement de vos données.</li>
                <li><strong>Opposition :</strong> vous opposer à certains traitements.</li>
              </ul>
              <p className="mt-2">Pour exercer ces droits, contactez-nous à <a href="mailto:contact@octavia-event.com" className="text-blue-600 dark:text-blue-400 hover:underline">contact@octavia-event.com</a>.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Sécurité
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, perte ou altération. Le site utilise le chiffrement HTTPS et les mots de passe sont hachés.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Mises à jour
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Cette politique peut être mise à jour. Nous vous informerons de toute modification notable par email ou via une notification sur le site. La version actuelle est disponible ci-dessous.
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Dernière mise à jour : 1er janvier 2025</p>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/mentions-legales" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            Mentions légales
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/cgu" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            Conditions Générales d'Utilisation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:scale-105 transition-all duration-200"
          >
            <Sparkles className="w-5 h-5" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}