import Link from "next/link";
import {
  LayoutDashboard,
  Compass,
  CalendarPlus,
  Calendar,
  Users,
  MessageSquare,
  QrCode,
  UserCog,
  Clock,
  User,
  Bell,
  ArrowRight,
  Sparkles,
  Home,
  Settings,
  FileText,
} from "lucide-react";

const sections = [
  {
    icon: LayoutDashboard,
    title: "Vue d'ensemble du tableau de bord",
    description:
      "Accédez à l'essentiel en un coup d'œil : statistiques de vos événements, dernières activités, et raccourcis vers les actions fréquentes. Tout est pensé pour vous faire gagner du temps.",
    action: { label: "Accéder au tableau de bord", href: "/dashboard" },
  },
  {
    icon: Compass,
    title: "Navigation et accès rapide",
    description:
      "Utilisez le menu latéral pour naviguer entre vos événements, vos invités, vos messages et vos paramètres. Les boutons d'action rapide vous permettent de créer un événement ou de consulter vos notifications en un clic.",
    action: { label: "Explorer le menu", href: "/dashboard" },
  },
  {
    icon: CalendarPlus,
    title: "Créer un événement",
    description:
      "Cliquez sur « Nouvel événement » pour lancer la création. Choisissez le type (anniversaire, mariage, soutenance, autre), sélectionnez un thème, puis renseignez les informations : titre, date, lieu, texte d'invitation, programme, et jusqu'à deux photos. Vous pouvez également choisir entre une invitation classique ou un billet.",
    action: { label: "Créer un événement", href: "/dashboard/event/new" },
  },
  {
    icon: Calendar,
    title: "Gérer vos événements",
    description:
      "Depuis la liste de vos événements, modifiez-les, consultez les invitations, gérez les invités, les messages, le contrôle d'accès, les collaborateurs et l'historique. Chaque événement a sa propre page dédiée.",
    action: { label: "Voir mes événements", href: "/dashboard" },
  },
  {
    icon: Users,
    title: "Gérer les invités",
    description:
      "Ajoutez des invités individuellement ou par lot (copier-coller depuis un CSV). Chaque invité reçoit un numéro unique, un lien personnel et un niveau (Standard, VIP, Super VIP ou personnalisé). Suivez leurs statuts (en attente, confirmé, annulé, entré).",
    action: { label: "Gérer les invités", href: "/dashboard" },
  },
  {
    icon: MessageSquare,
    title: "Messages des invités",
    description:
      "Consultez tous les messages laissés par vos invités. Vous pouvez également modifier ou supprimer les messages si vous êtes l'organisateur. Répondez directement depuis la page de l'événement.",
    action: { label: "Voir les messages", href: "/dashboard" },
  },
  {
    icon: QrCode,
    title: "Contrôle d'accès par QR code",
    description:
      "À l'entrée de votre événement, utilisez le scanner de QR code pour valider la présence de chaque invité. Le statut de l'invité passe automatiquement à « Entré ». Vous pouvez également consulter la liste des invités et leur statut en temps réel.",
    action: { label: "Accéder au contrôle", href: "/dashboard" },
  },
  {
    icon: UserCog,
    title: "Collaborateurs",
    description:
      "Invitez jusqu'à deux collaborateurs par événement pour vous aider à gérer les invités, les messages et les invitations. Ils doivent avoir un compte sur Octavia Event. Gérez les droits de chaque collaborateur.",
    action: { label: "Gérer les collaborateurs", href: "/dashboard" },
  },
  {
    icon: Clock,
    title: "Historique des modifications",
    description:
      "Retrouvez toutes les actions effectuées sur votre événement : ajout/suppression d'invités, modification des informations, validation des entrées, etc. Un journal complet pour garder une trace de tout.",
    action: { label: "Voir l'historique", href: "/dashboard" },
  },
  {
    icon: User,
    title: "Profil et paramètres",
    description:
      "Personnalisez votre profil : modifiez vos informations personnelles, gérez votre numéro de téléphone, vérifiez votre email, et consultez votre portefeuille. Accédez également aux notifications et aux préférences de l'application.",
    action: { label: "Aller au profil", href: "/profile" },
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "Restez informé des événements importants : confirmation de présence, nouveaux messages, validation de dépôt, limites d'invités atteintes, etc. Gérez vos notifications et marquez-les comme lues.",
    action: { label: "Voir les notifications", href: "/profile" },
  },
  {
    icon: Home,
    title: "Guide général d'utilisation",
    description:
      "Si vous débutez sur Octavia Event, consultez notre guide général d'utilisation pour découvrir toutes les fonctionnalités de la plateforme.",
    action: { label: "Lire le guide général", href: "/guide-utilisation" },
  },
];

export default function GuideDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 md:py-16 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Guide du tableau de bord
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez en détail chaque fonctionnalité de votre tableau de bord pour tirer le meilleur parti d'Octavia Event.
          </p>
        </div>

        {/* Grille des sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02] hover:bg-white dark:hover:bg-gray-900 shadow-sm hover:shadow-lg"
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
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Besoin d'aide ? Consultez le{" "}
            <Link href="/guide-utilisation" className="text-blue-600 dark:text-blue-400 hover:underline">
              guide général d'utilisation
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}