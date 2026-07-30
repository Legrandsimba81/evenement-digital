// app/(protected)/profile/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Calendar, Mail, User, Users, Wallet, ArrowDownRight, ArrowUpRight, CreditCard } from "lucide-react";
import Link from "next/link";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      events: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) redirect("/login");

  return <ProfileClient user={user} />;
}