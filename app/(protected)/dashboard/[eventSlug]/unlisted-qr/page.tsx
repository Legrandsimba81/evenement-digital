import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { canManageEvent } from "@/lib/permissions";
import UnlistedQrClient from "./UnlistedQrClient";
import { randomBytes } from "crypto";

export default async function UnlistedQrPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // ✅ Résoudre la promesse
  const { eventSlug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    select: {
      id: true,
      title: true,
      isPaid: true,
      unlistedGuestsLimit: true,
      unlistedGuestsCount: true,
      unlistedQrToken: true,
      userId: true,
    },
  });

  if (!event) redirect("/dashboard");
  if (!event.isPaid) redirect(`/dashboard/${eventSlug}`);

  const hasAccess = await canManageEvent(event.id, session.user.id);
  if (!hasAccess) redirect("/dashboard");

  // Générer un token si absent
  let token = event.unlistedQrToken;
  if (!token) {
    token = randomBytes(32).toString("hex");
    await prisma.event.update({
      where: { id: event.id },
      data: { unlistedQrToken: token },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.octaviaevent.com";
  const qrUrl = `${baseUrl}/api/scan-unlisted?token=${token}`;

  return (
    <UnlistedQrClient
      event={event}
      qrUrl={qrUrl}
      token={token}
    />
  );
}