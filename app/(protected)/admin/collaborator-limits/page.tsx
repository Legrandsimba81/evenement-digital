import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CollaboratorLimitsClient from "@/components/admin/CollaboratorLimitsClient";

export default async function CollaboratorLimitsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      collaboratorLimits: true,
    },
    orderBy: { name: "asc" },
  });

  return <CollaboratorLimitsClient users={users} />;
}