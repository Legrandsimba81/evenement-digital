// app/(protected)/profile/page.tsx (serveur)
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      events: { orderBy: { createdAt: "desc" }, take: 5 },
      transactions: { orderBy: { createdAt: "desc" }, take: 10 },
      shops: {
        orderBy: { createdAt: "desc" },
        include: { category: { select: { name: true } } },
      },
    },
  });

  if (!user) redirect("/login");

  return <ProfileClient user={user} />;
}