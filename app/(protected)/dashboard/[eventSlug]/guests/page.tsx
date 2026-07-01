import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import GuestForm from "@/components/forms/GuestForm";
import GuestList from "@/components/guests/GuestList";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { eventSlug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: { guests: true, collaborators: true },
  });

  if (!event) return notFound();

  const isOwner = event.userId === userId;
  const isCollaborator = event.collaborators.some((c) => c.userId === userId);
  if (!isOwner && !isCollaborator) redirect("/dashboard");

  const isAutreBillet = event.type === "AUTRE" && event.format === "BILLET";
  const label = isAutreBillet ? "billets" : "invités";

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/dashboard/${event.slug}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
        >
          <ArrowLeft size={18} />
          Retour
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des {label} – {event.title}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <GuestForm eventId={event.id} />
        <div className="mt-6">
          <GuestList guests={event.guests} eventId={event.id} eventSlug={event.slug} event={event} />
        </div>
      </div>
    </div>
  );
}