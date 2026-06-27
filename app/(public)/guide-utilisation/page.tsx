import Link from "next/link";

export default function GuideUtilisationPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">📖 Guide d’utilisation</h1>

      <div className="space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Créer un compte</h2>
          <p className="mt-2">
            Rendez-vous sur la page d’inscription et remplissez le formulaire (nom, email, mot de passe).
            Vous pouvez aussi vous inscrire avec Google.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Créer un événement</h2>
          <p className="mt-2">
            Depuis votre tableau de bord, cliquez sur “Nouvel événement”. Choisissez le type (anniversaire, mariage, soutenance, autre).
            Remplissez les informations (titre, date, lieu, texte d’invitation, etc.) et ajoutez une photo.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Ajouter des invités</h2>
          <p className="mt-2">
            Dans la page de gestion de l’événement, ajoutez vos invités avec leur prénom, nom et titre (optionnel).
            Chaque invité reçoit un numéro unique et un lien personnel.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Partager l’invitation</h2>
          <p className="mt-2">
            Copiez le lien d’invitation ou utilisez le bouton WhatsApp pour partager avec vos invités.
            Ils pourront voir l’invitation en entrant leur prénom et nom.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Suivre les réponses</h2>
          <p className="mt-2">
            Les invités peuvent confirmer leur présence ou indiquer leur indisponibilité.
            Vous voyez le statut de chaque invité dans la liste (en attente, annulé, entré).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">6. Télécharger l’invitation</h2>
          <p className="mt-2">
            Les invités peuvent télécharger l’invitation en image (avec QR code) depuis la page d’invitation.
          </p>
        </section>
      </div>
    </div>
  );
}