// app/(public)/contact/page.tsx
import ContactForm from "@/components/contact/ContactForm";
import { MapPin, Mail, Phone, Clock, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Contactez-nous - Octavia Event",
  description: "Une question ? Contactez l'équipe Octavia Event pour toute demande concernant vos événements.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Contactez-nous
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Une question, une suggestion, un problème ? N'hésitez pas à nous contacter.
            Nous vous répondrons dans les plus brefs délais.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire de contact */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Envoyez-nous un message
              </h2>
              <ContactForm />
            </div>
          </div>

          {/* Informations de contact */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Nos coordonnées
              </h3>

              <div className="space-y-5">
                {/* WhatsApp */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">WhatsApp</p>
                    <a
                      href="https://wa.me/243827733286"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition"
                    >
                      +243 827 733 286
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email</p>
                    <a
                      href="mailto:legrandsimba81@gmail.com"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
                    >
                      legrandsimba81@gmail.com
                    </a>
                  </div>
                </div>

                {/* Siège */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Notre siège</p>
                    <a
                      href="https://maps.apple.com/?address=Rue%20Matadi,%20Butembo,%20R%C3%A9publique%20d%C3%A9mocratique%20du%20Congo&ll=0.137994,29.291300&q=Rue%20Matadi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition text-sm"
                    >
                      Rue Matadi, Butembo, RDC
                    </a>
                  </div>
                </div>

                {/* Horaires */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Horaires</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Lundi - Vendredi : 8h - 18h
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Samedi : 9h - 14h
                    </p>
                  </div>
                </div>
              </div>

              {/* Bouton WhatsApp flottant (affiché en bas à droite) */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <a
                  href="https://wa.me/243827733286"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl transition shadow-sm"
                >
                  <MessageCircle size={20} />
                  Nous contacter sur WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp flottant (bouton fixe en bas à droite) */}
      <a
        href="https://wa.me/243827733286"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition hover:scale-110"
        aria-label="Contactez-nous sur WhatsApp"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}