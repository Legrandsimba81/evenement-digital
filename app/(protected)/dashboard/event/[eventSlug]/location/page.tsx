// app/(protected)/dashboard/event/[eventSlug]/location/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LocationManager from "@/components/events/LocationManager";

export const dynamic = "force-dynamic";

export default async function EventLocationPage({ params }: { params: Promise<{ eventSlug: string }> }) {
  const { eventSlug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    select: {
      id: true,
      title: true,
      slug: true,
      locationName: true,
      locationAddress: true,
      locationLat: true,
      locationLng: true,
      locationUrl: true,
      userId: true,
    },
  });
  if (!event) return notFound();
  if (event.userId !== session.user.id && session.user.role !== "ADMIN") {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Vous n'êtes pas autorisé à modifier ce lieu.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/${event.slug}`} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
          <ArrowLeft size={16} /> Retour à l'événement
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion du lieu – {event.title}</h1>
      </div>

      <LocationManager event={event} />
    </div>
  );
}