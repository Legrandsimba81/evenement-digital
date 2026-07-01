import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import InvitationCard from "@/components/invitation/InvitationCard";
import MessageForm from "@/components/forms/MessageForm";
import GuestVerificationForm from "@/components/invitation/GuestVerificationForm";
import FloatingHearts from "@/components/invitation/FloatingHearts";
import { Heart, UserX, Phone, ArrowLeft, Check } from "lucide-react";
import MessageSuggestions from "@/components/invitation/MessageSuggestions";
import MessageItem from "@/components/invitation/MessageItem";

// ✅ Métadonnées dynamiques (Open Graph, Twitter, etc.)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { title: true, imageUrl: true, invitationText: true, date: true, location: true },
  });
  if (!event) return { title: "Invitation" };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://evenement-digital.vercel.app";
  const imageUrl = event.imageUrl
    ? (event.imageUrl.startsWith("http") ? event.imageUrl : `${baseUrl}${event.imageUrl}`)
    : `${baseUrl}/og-image.png`;

  return {
    title: `Invitation - ${event.title}`,
    description: event.invitationText || `Venez célébrer avec nous !`,
    openGraph: {
      title: `Invitation - ${event.title}`,
      description: event.invitationText || `Venez célébrer avec nous !`,
      url: `${baseUrl}/invitation/${slug}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Invitation - ${event.title}`,
      description: event.invitationText || `Venez célébrer avec nous !`,
      images: [imageUrl],
    },
  };
}

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

  // ✅ Déterminer si c'est un billet
  const isBillet = event.type === "AUTRE" && event.format === "BILLET";

  if (!firstName || !lastName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500/5 to-secondary-500/5 flex items-center justify-center p-4">
        <GuestVerificationForm slug={slug} />
      </div>
    );
  }

  const guest = event.guests.find(
    (g) =>
      g.firstName.toLowerCase() === firstName.toLowerCase() &&
      g.lastName.toLowerCase() === lastName.toLowerCase()
  );

  if (!guest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/30 to-primary-50/30 dark:from-red-950/20 dark:to-primary-950/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <UserX size={48} className="text-red-500 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Vous n'êtes pas sur la liste des invités.
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
            Si c'est une erreur, contactez l'organisateur via WhatsApp.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {event.whatsappNumber && (
              <a
                href={`https://wa.me/${event.whatsappNumber}?text=Je%20n%27ai%20pas%20reçu%20d%27invitation%20pour%20${encodeURIComponent(
                  event.title
                )}`}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl transition text-sm font-medium"
              >
                <Phone size={18} />
                Contacter
              </a>
            )}
            <Link
              href={`/invitation/${slug}`}
              className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl transition text-sm font-medium"
            >
              <ArrowLeft size={18} />
              Réessayer
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (guest.status === "entre") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-primary-50/30 dark:from-green-950/20 dark:to-primary-950/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Check size={48} className="text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
            {guest.title ? `${guest.title} ${guest.firstName} ${guest.lastName}` : `${guest.firstName} ${guest.lastName}`}
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            est déjà entré dans la salle.
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Profitez bien de l'événement !
          </p>
        </div>
      </div>
    );
  }

  const guestName = `${guest.firstName} ${guest.lastName}`;
  const eventType = event.type as keyof typeof messageSuggestions;
  const suggestions = messageSuggestions[eventType] || messageSuggestions["AUTRE"];

  const messagesLove = event.messages.filter((m) =>
    m.content.toLowerCase().includes("amour") ||
    m.content.toLowerCase().includes("❤") ||
    m.content.toLowerCase().includes("love")
  );

  let themeValue = null;
  if (event.theme) {
    try {
      themeValue = typeof event.theme === 'string' ? event.theme : JSON.stringify(event.theme);
    } catch {
      themeValue = null;
    }
  }

  const eventForCard = {
    ...event,
    date: event.date.toISOString(),
    theme: themeValue,
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary-500/5 to-secondary-500/5 dark:from-primary-950/20 dark:to-secondary-950/20 py-8 px-4 sm:py-12 sm:px-6">
      <FloatingHearts />
      <div className="max-w-3xl mx-auto relative z-10 space-y-6">
        <InvitationCard
          event={eventForCard}
          guestName={guestName}
          guestTitle={guest.title || undefined}
          guestId={guest.id}
          guestInvitationType={guest.invitationType}
        />

        {/* Messages d'amour pour les mariages (uniquement si ce n'est pas un billet) */}
        {!isBillet && event.type === "MARIAGE" && messagesLove.length > 0 && (
          <div className="bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <Heart size={24} className="fill-rose-500" />
              Messages d'amour
            </h2>
            <div className="mt-4 space-y-4">
              {messagesLove.map((msg) => (
                <div key={msg.id} className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl shadow-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {msg.guestName}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages des invités (uniquement si ce n'est pas un billet) */}
        {!isBillet && (
          <div className="bg-gray-50/70 dark:bg-gray-800/30 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Messages des invités
            </h2>
            {event.messages.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6 bg-white/50 dark:bg-gray-900/30 rounded-xl">
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
                    currentGuestName={guestName}
                    eventId={event.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Formulaire de message (uniquement si ce n'est pas un billet) */}
        {!isBillet && (
          <div className="bg-white/70 dark:bg-gray-900/50 rounded-2xl p-5 sm:p-6 shadow-sm backdrop-blur-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Laissez un message
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Partagez vos vœux avec les organisateurs.
            </p>
            <MessageSuggestions suggestions={suggestions} />
            <MessageForm eventId={event.id} guestName={guestName} guestId={guest.id} />
          </div>
        )}
      </div>
    </div>
  );
}