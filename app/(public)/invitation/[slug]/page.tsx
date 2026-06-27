import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvitationCard from "@/components/invitation/InvitationCard";
import MessageForm from "@/components/forms/MessageForm";
import GuestVerificationForm from "@/components/invitation/GuestVerificationForm";
import FloatingHearts from "@/components/invitation/FloatingHearts";
import { Heart } from "lucide-react";

export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ firstName?: string; lastName?: string; token?: string }>;
}) {
  const { slug } = await params;
  const { firstName, lastName, token } = await searchParams;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: { messages: true, guests: true },
  });

  if (!event) return notFound();

  // Si token présent, on l'utilise pour identifier l'invité
  let guest = null;
  if (token) {
    guest = event.guests.find((g) => g.invitationNumber === token);
  } else if (firstName && lastName) {
    guest = event.guests.find(
      (g) =>
        g.firstName.toLowerCase() === firstName.toLowerCase() &&
        g.lastName.toLowerCase() === lastName.toLowerCase()
    );
  }

  // Si pas de guest, afficher le formulaire de vérification (sauf si token invalide)
  if (!guest) {
    // Si token est présent mais invalide, on affiche un message d'erreur
    if (token) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl text-center border border-gray-200 dark:border-gray-800">
            <div className="text-6xl mb-4">😢</div>
            <h1 className="text-2xl font-bold text-red-500">
              Lien d'invitation invalide.
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Vérifiez le lien ou contactez l'organisateur.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500/5 to-secondary-500/5 flex items-center justify-center p-4">
        <GuestVerificationForm slug={slug} />
      </div>
    );
  }

  const guestName = `${guest.firstName} ${guest.lastName}`;
  const messagesLove = event.messages.filter((m) =>
    m.content.toLowerCase().includes("amour") ||
    m.content.toLowerCase().includes("❤") ||
    m.content.toLowerCase().includes("love")
  );

  // Convertir event pour le passer au client
  const eventForCard = {
    ...event,
    date: event.date.toISOString(),
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary-500/5 to-secondary-500/5 py-12 px-4">
      <FloatingHearts />
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 text-center bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <span className="font-medium">📋 Invitation {guest.invitationNumber}</span>
          <span className="mx-2">•</span>
          <span>
            {guest.invitationType === "couple" ? "👫 Invitation pour 2 personnes" : "🧑 Invitation pour 1 personne"}
          </span>
        </div>

        <InvitationCard
          event={eventForCard}
          guestName={guestName}
          guestTitle={guest.title || undefined}
          guestId={guest.id}
          guest={guest}
        />

        {/* Messages d'amour */}
        {event.type === "MARIAGE" && messagesLove.length > 0 && (
          <div className="mt-8 p-6 bg-pink-50 dark:bg-pink-950/20 rounded-2xl border border-pink-200 dark:border-pink-800">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-pink-600 dark:text-pink-400">
              <Heart size={24} className="fill-pink-500" />
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

        {/* Messages des invités */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Messages des invités
          </h2>
          {event.messages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8 bg-white dark:bg-gray-900 rounded-xl">
              Aucun message pour le moment.
            </p>
          ) : (
            <div className="space-y-4">
              {event.messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {msg.guestName}
                    </p>
                    <span className="text-sm text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{msg.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulaire de message */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Laissez un message
            </h2>
            <MessageForm eventId={event.id} guestName={guestName} />
          </div>
        </div>
      </div>
    </div>
  );
}