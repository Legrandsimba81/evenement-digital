import Link from "next/link";
import {
  Scale,
  Building2,
  Mail,
  Phone,
  Globe,
  FileText,
  Shield,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 md:py-16 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Mentions légales
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Informations légales relatives à l'éditeur du site Octavia Event.
          </p>
        </div>

        {/* Contenu */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Éditeur du site
            </h2>
            <div className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>Raison sociale :</strong> Octavia Event SAS</p>
              <p><strong>Siège social :</strong> 123 Avenue des Créateurs, 75001 Paris, France</p>
              <p><strong>Numéro SIRET :</strong> 123 456 789 00012</p>
              <p><strong>Capital social :</strong> 10 000 $</p>
              <p><strong>Directeur de la publication :</strong> Jean Dupont</p>
              <p><strong>Hébergement :</strong> Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Contact
            </h2>
            <div className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>Email :</strong> <a href="mailto:contact@octavia-event.com" className="text-blue-600 dark:text-blue-400 hover:underline">contact@octavia-event.com</a></p>
              <p><strong>Téléphone :</strong> <a href="tel:+33123456789" className="text-blue-600 dark:text-blue-400 hover:underline">+33 1 23 45 67 89</a></p>
              <p><strong>Adresse :</strong> 123 Avenue des Créateurs, 75001 Paris</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Propriété intellectuelle
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              L'ensemble des contenus présents sur ce site (textes, images, logos, vidéos, etc.) est la propriété exclusive de Octavia Event SAS ou de ses partenaires. Toute reproduction, représentation, modification, publication ou adaptation totale ou partielle des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Responsabilité
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Octavia Event SAS s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, nous ne pouvons garantir l'exhaustivité ou l'absence de modification par un tiers. L'utilisation des informations est sous la responsabilité de l'utilisateur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Dernière mise à jour
            </h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">1er janvier 2025</p>
          </section>
        </div>

        {/* Navigation vers les autres pages juridiques */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/cgu" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            Conditions Générales d'Utilisation
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/politique-confidentialite" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            Politique de confidentialité
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Bouton de retour à l'accueil */}
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