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
  searchParams: Promise<{ firstName?: string; lastName?: string }>;
}) {
  const { slug } = await params;
  const { firstName, lastName } = await searchParams;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: { messages: true, guests: true },
  });

  if (!event) return notFound();

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl text-center border border-gray-200 dark:border-gray-800">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold text-red-500">
            Vous n'êtes pas sur la liste des invités.
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Si c'est une erreur, contactez-nous sur WhatsApp.
          </p>
          {event.whatsappNumber && (
            <a
              href={`https://wa.me/${event.whatsappNumber}?text=Je%20n%27ai%20pas%20reçu%20d%27invitation%20pour%20${encodeURIComponent(
                event.title
              )}`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl mt-6 transition"
            >
              Contacter l'organisateur
            </a>
          )}
        </div>
      </div>
    );
  }

  const guestName = `${guest.firstName} ${guest.lastName}`;
  const messagesLove = event.messages.filter((m) =>
    m.content.toLowerCase().includes("amour") ||
    m.content.toLowerCase().includes("❤") ||
    m.content.toLowerCase().includes("love")
  );

  const eventForCard = {
    ...event,
    date: event.date.toISOString(),
    imageUrl: event.imageUrl,
    invitationImageUrl: event.invitationImageUrl,
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary-500/5 to-secondary-500/5 py-12 px-4">
      <FloatingHearts />
      <div className="max-w-3xl mx-auto relative z-10">
        <InvitationCard
          event={eventForCard}
          guestName={guestName}
          guestTitle={guest.title || undefined}
          guestId={guest.id}
        />

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