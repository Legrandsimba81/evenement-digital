import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { canManageEvent } from "@/lib/permissions";
import ScanUnlistedClient from "./ScanUnlistedClient";

export default async function ScanUnlistedPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { eventSlug } = await params;
  const { token } = await searchParams;

  const event = await prisma.event.findFirst({
    where: {
      OR: [{ slug: eventSlug }, { id: eventSlug }],
    },
    select: { id: true, title: true, slug: true, userId: true },
  });

  if (!event) return notFound();

  const hasAccess = await canManageEvent(event.id, session.user.id);
  if (!hasAccess) return notFound();

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scanner - Invités hors liste</h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
          Événement : <span className="font-semibold text-gray-900 dark:text-white">{event.title}</span>
        </p>
      </div>

      <ScanUnlistedClient eventId={event.id} initialToken={token} />
    </div>
  );
}