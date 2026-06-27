import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GateClient from "@/components/gate/GateClient";

export default async function GatePage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { eventSlug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: {
      guests: {
        orderBy: { firstName: "asc" },
      },
    },
  });

  if (!event) redirect("/dashboard");
  if (event.userId !== session.user.id) redirect("/dashboard");

  return <GateClient event={event} />;
}