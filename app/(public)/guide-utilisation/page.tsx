import Link from "next/link";
import {
  UserPlus,
  CalendarPlus,
  Users,
  Share2,
  MessageSquare,
  Download,
  QrCode,
  UserCog,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const sections = [
  {
    icon: UserPlus,
    title: "Créer un compte",
    description:
      "Inscrivez-vous en quelques clics avec votre email ou via Google. Remplissez votre profil (nom, email, téléphone) pour accéder à votre espace événementiel.",
    action: { label: "S'inscrire", href: "/register" },
  },
  {
    icon: CalendarPlus,
    title: "Créer un événement",
    description:
      "Depuis votre tableau de bord, cliquez sur « Nouvel événement ». Choisissez le type (anniversaire, mariage, soutenance, autre), puis renseignez les informations essentielles : titre, date, lieu, texte d'invitation, et deux photos.",
    action: { label: "Créer un événement", href: "/dashboard/event/new" },
  },
  {
    icon: Users,
    title: "Ajouter des invités",
    description:
      "Ajoutez vos invités un par un ou par lot (copier-coller depuis un fichier CSV). Chaque invité reçoit un numéro unique et un lien personnel pour confirmer sa présence.",
    action: { label: "Gérer les invités", href: "/dashboard" },
  },
  {
    icon: Share2,
    title: "Partager l'invitation",
    description:
      "Copiez le lien d'invitation ou utilisez le bouton WhatsApp pour partager avec vos invités. Ils pourront consulter l'invitation en entrant leur prénom et nom (pour une invitation publique) ou simplement en cliquant sur le lien privé.",
    action: { label: "Partager maintenant", href: "/dashboard" },
  },
  {
    icon: MessageSquare,
    title: "Suivre les messages",
    description:
      "Les invités peuvent envoyer des messages (vœux, questions). Retrouvez tous les échanges dans la section dédiée de votre tableau de bord, à côté de la liste des invités.",
    action: { label: "Voir les messages", href: "/dashboard" },
  },
  {
    icon: Download,
    title: "Télécharger l'invitation",
    description:
      "Les invités peuvent télécharger l'invitation en image (avec QR code) depuis la page d'invitation. Vous pouvez aussi télécharger le QR code général pour l'imprimer sur un support physique.",
    action: { label: "Télécharger", href: "/dashboard" },
  },
  {
    icon: QrCode,
    title: "Scanner le QR code",
    description:
      "À l'entrée de l'événement, utilisez le bouton « Contrôle » dans votre tableau de bord pour scanner le QR code de chaque invité et valider son entrée en temps réel.",
    action: { label: "Scanner", href: "/dashboard" },
  },
  {
    icon: UserCog,
    title: "Ajouter des collaborateurs",
    description:
      "Invitez jusqu'à deux collaborateurs par événement pour vous aider à gérer les invités, les messages et les invitations. Ils doivent avoir un compte sur Octavia Event.",
    action: { label: "Gérer les collaborateurs", href: "/dashboard" },
  },
];

export default function GuideUtilisationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 md:py-16 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          {/* <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div> */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Guide d'utilisation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez toutes les fonctionnalités d'Octavia Event pour organiser vos événements en toute simplicité.
          </p>
        </div>

        {/* Grille des sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02] hover:bg-white dark:hover:bg-gray-900"
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

        {/* Pied de page / appel à l'action */}
        <div className="mt-12 text-center">
          <Link
            href="/dashboard/event/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:scale-105 transition-all duration-200"
          >
            <CalendarPlus className="w-5 h-5" />
            Créer mon premier événement
          </Link>
        </div>
      </div>
    </div>
  );
}