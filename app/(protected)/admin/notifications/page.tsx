import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Bell, Send } from "lucide-react";
import AdminNotificationsClient from "./AdminNotificationsClient";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="text-blue-500" size={24} />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications - Administration</h1>
      </div>
      <AdminNotificationsClient users={users} />
    </div>
  );
}