import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvitationCard from "@/components/invitation/InvitationCard";
import MessageForm from "@/components/forms/MessageForm";
import GuestVerificationForm from "@/components/invitation/GuestVerificationForm";
import FloatingHearts from "@/components/invitation/FloatingHearts";
import { Heart, UserX, CircleCheckBig, Phone, ArrowLeft, Link } from "lucide-react";
import MessageSuggestions from "@/components/invitation/MessageSuggestions";
import MessageItem from "@/components/invitation/MessageItem";

// Suggestions de messages selon le type
const messageSuggestions: Record<string, string[]> = {
  MARIAGE: [
    "Félicitations aux jeunes mariés ! 💍",
    "Que votre amour dure toujours ! ❤️",
    "Merci pour ce moment magique !",
    "Vive les mariés ! 🥂",
  ],
  ANNIVERSAIRE: [
    "Joyeux anniversaire ! 🎂",
    "Que cette journée soit inoubliable ! 🎉",
    "Bon anniversaire et plein de bonheur !",
    "Profitez bien de ce jour spécial !",
  ],
  SOUTENANCE: [
    "Félicitations pour cette soutenance ! 🎓",
    "Bravo pour ce travail remarquable !",
    "La fin d’un long parcours, bravo !",
    "Succès garanti, continuez ainsi !",
  ],
  AUTRE: [
    "Merci pour cette belle célébration !",
    "Vive la fête ! 🎊",
    "Quelle belle occasion !",
    "Profitez bien de ce moment !",
  ],
};

export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ firstName?: string; lastName?: string }>;
}) {
  const { slug } = await params;
  const { firstName, lastName } = await searchParams;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: { messages: true, guests: true },
  });

  if (!event) return notFound();

  // Formulaire de vérification si pas de noms
  if (!firstName || !lastName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500/5 to-secondary-500/5 flex items-center justify-center p-4">
        <GuestVerificationForm slug={slug} />
      </div>
    );
  }

  // Recherche de l'invité
  const guest = event.guests.find(
    (g) =>
      g.firstName.toLowerCase() === firstName.toLowerCase() &&
      g.lastName.toLowerCase() === lastName.toLowerCase()
  );

  // Si invité non trouvé
  if (!guest) {
    return (
      <div className="max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl text-center border border-gray-200 dark:border-gray-800">
        <div className="flex justify-center mb-4">
          <UserX size={64} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-red-500">
          Vous n'êtes pas sur la liste des invités.
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Si c'est une erreur, contactez-nous sur WhatsApp.
        </p>
        <div className="flex flex-col">
        {event.whatsappNumber && (
          <a
            href={`https://wa.me/${event.whatsappNumber}?text=Je%20n%27ai%20pas%20reçu%20d%27invitation%20pour%20${encodeURIComponent(
              event.title
            )}`}
            target="_blank"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl mt-4 transition text-sm"
          >
            <Phone size={18} />
            Contacter l'organisateur
          </a>
        )}
        {/* Bouton Réessayer */}
        <Link
          href={`/invitation/${slug}`}
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl mt-3 transition text-sm"
        >
          <ArrowLeft size={18} />
          Réessayer
        </Link>
        </div>
      </div>
    );
  }

  // Si invité déjà entré
  if (guest.status === "entre") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl text-center border border-gray-200 dark:border-gray-800">
          <div className="flex justify-center mb-4">
            <CircleCheckBig size={64} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-green-600">
            {guest.title ? `${guest.title} ${guest.firstName} ${guest.lastName}` : `${guest.firstName} ${guest.lastName}`}
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            est déjà dans la salle de fête.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Bienvenue et profitez de l'événement !
          </p>
        </div>
      </div>
    );
  }

  // Sinon, afficher l'invitation
  const guestName = `${guest.firstName} ${guest.lastName}`;
  const eventType = event.type as keyof typeof messageSuggestions;
  const suggestions = messageSuggestions[eventType] || messageSuggestions["AUTRE"];

  const messagesLove = event.messages.filter((m) =>
    m.content.toLowerCase().includes("amour") ||
    m.content.toLowerCase().includes("❤") ||
    m.content.toLowerCase().includes("love")
  );

  const eventForCard = {
    ...event,
    date: event.date.toISOString(),
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary-500/5 to-secondary-500/5 py-8 px-4 sm:py-12 sm:px-6">
      <FloatingHearts />
      <div className="max-w-3xl mx-auto relative z-10">
        <InvitationCard
          event={eventForCard}
          guestName={guestName}
          guestTitle={guest.title || undefined}
          guestId={guest.id}
        />

        {/* Messages d'amour pour les mariages */}
        {event.type === "MARIAGE" && messagesLove.length > 0 && (
          <div className="mt-6 p-5 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-800">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <Heart size={24} className="fill-rose-500" />
              Messages d'amour
            </h2>
            <div className="mt-4 space-y-4">
              {messagesLove.map((msg) => (
                <div key={msg.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {msg.guestName}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages des invités avec suppression */}
        <div className="mt-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Messages des invités
          </h2>
          {event.messages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8 bg-white dark:bg-gray-900 rounded-xl">
              Aucun message pour le moment.
            </p>
          ) : (
            <div className="space-y-4">
              {event.messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={{
                    ...msg,
                    createdAt: msg.createdAt.toISOString(),
                  }}
                  currentGuestId={guest.id}
                  currentGuestName={guestName}  // ajout
                  eventId={event.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Formulaire de message avec suggestions */}
        <div className="mt-6">
          <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Laissez un message
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Partagez vos vœux avec les organisateurs.
            </p>
            <MessageSuggestions suggestions={suggestions} />
            <MessageForm eventId={event.id} guestName={guestName} guestId={guest.id} />
          </div>
        </div>
      </div>
    </div>
  );
}