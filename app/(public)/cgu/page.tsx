import Link from "next/link";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Shield,
  UserCheck,
  CreditCard,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 md:py-16 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            En utilisant Octavia Event, vous acceptez les présentes conditions.
          </p>
        </div>

        {/* Contenu */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Article 1 – Objet
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site internet Octavia Event et de ses services. Elles définissent les droits et obligations des utilisateurs et de l'éditeur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Article 2 – Acceptation
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              L'utilisation du site implique l'acceptation pleine et entière des présentes CGU. L'utilisateur s'engage à les respecter scrupuleusement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Article 3 – Services et tarifs
            </h2>
            <div className="mt-4 space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                Octavia Event propose différents plans tarifaires (Starter, Pro, Business) exprimés en dollars ($). Les prix sont TTC et peuvent être modifiés à tout moment. Les utilisateurs sont informés préalablement.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Starter :</strong> Gratuit – 1 événement, 50 invités, invitation personnalisée, statistiques basiques.</li>
                <li><strong>Pro :</strong> 19 $/mois – événements illimités, invités illimités, QR code personnalisé, 2 collaborateurs.</li>
                <li><strong>Business :</strong> 49 $/mois – tout le Pro, collaborateurs illimités, support prioritaire, analyses avancées.</li>
              </ul>
              <p>Les paiements sont sécurisés et effectués par carte bancaire ou virement. Un essai gratuit de 14 jours est possible pour les formules payantes.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Article 4 – Responsabilités
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              L'utilisateur est responsable des données qu'il publie (événements, invités, messages). Octavia Event s'engage à protéger la confidentialité des données conformément à la Politique de confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Article 5 – Résiliation
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              L'utilisateur peut résilier son compte à tout moment. En cas de non-respect des CGU, Octavia Event se réserve le droit de suspendre ou supprimer le compte sans préavis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Article 6 – Mises à jour
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs en seront informés par email ou par une notification sur le site. La version en vigueur est celle disponible en ligne.
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
          <Link href="/politique-confidentialite" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            Politique de confidentialité
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