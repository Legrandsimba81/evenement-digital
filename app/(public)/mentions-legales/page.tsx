import Link from "next/link";

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Mentions légales</h1>

      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Éditeur du site</h2>
          <p className="mt-2">
            Simba Event est une application de gestion d’invitations éditée par <strong>Simba Event</strong>.<br />
            Siège social : RDC, Nord-Kivu<br />
            Contact : <a href="mailto:contact@simba-event.com" className="text-primary-500 hover:underline">contact@simba-event.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Hébergement</h2>
          <p className="mt-2">
            Le site est hébergé par Vercel Inc.<br />
            340 S Lemon Ave #4133, Walnut, CA 91789, USA.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Propriété intellectuelle</h2>
          <p className="mt-2">
            L’ensemble du contenu (textes, images, logos, icônes) est la propriété exclusive de Simba Event.
            Toute reproduction est interdite sans autorisation préalable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Données personnelles</h2>
          <p className="mt-2">
            Les données collectées sont utilisées uniquement pour le fonctionnement de l’application.
            Conformément à la loi, vous disposez d’un droit d’accès, de rectification et de suppression.
          </p>
        </section>
      </div>
    </div>
  );
}