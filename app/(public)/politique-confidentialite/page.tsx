export default function PolitiqueConfidentialitePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Politique de confidentialité</h1>

      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Collecte des données</h2>
          <p className="mt-2">
            Nous collectons les informations suivantes lors de votre inscription :
            nom, prénom, adresse email, numéro de téléphone (optionnel).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Utilisation des données</h2>
          <p className="mt-2">
            Vos données sont utilisées pour gérer votre compte, créer et partager vos invitations.
            Elles ne sont jamais vendues à des tiers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Sécurité</h2>
          <p className="mt-2">
            Nous mettons en œuvre des mesures de sécurité pour protéger vos données contre tout accès non autorisé.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Vos droits</h2>
          <p className="mt-2">
            Vous pouvez accéder, modifier ou supprimer vos données à tout moment depuis votre profil.
            Pour toute question, contactez-nous à <a href="mailto:contact@simba-event.com" className="text-primary-500 hover:underline">contact@simba-event.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Cookies</h2>
          <p className="mt-2">
            Nous utilisons des cookies essentiels au bon fonctionnement du site (authentification, session).
          </p>
        </section>
      </div>
    </div>
  );
}