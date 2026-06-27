export default function CGUPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Conditions Générales d’Utilisation</h1>

      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Objet</h2>
          <p className="mt-2">
            Les présentes CGU régissent l’utilisation de l’application Simba Event. En vous inscrivant, vous acceptez ces conditions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Compte utilisateur</h2>
          <p className="mt-2">
            Vous êtes responsable de la confidentialité de vos identifiants. Toute activité réalisée depuis votre compte vous engage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Utilisation du service</h2>
          <p className="mt-2">
            L’application vous permet de créer, gérer et partager des invitations. Vous vous engagez à une utilisation conforme à la loi.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Responsabilité</h2>
          <p className="mt-2">
            Simba Event ne pourra être tenu responsable de l’utilisation frauduleuse de vos données par un tiers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Résiliation</h2>
          <p className="mt-2">
            Vous pouvez supprimer votre compte à tout moment depuis l’interface. Nous pouvons suspendre un compte en cas de non-respect des CGU.
          </p>
        </section>
      </div>
    </div>
  );
}