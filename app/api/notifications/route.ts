import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(notifications);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { action, notificationId } = await request.json();

  if (action === "markRead") {
    await prisma.notification.update({
      where: { id: notificationId, userId: session.user.id },
      data: { read: true },
    });
  } else if (action === "markAllRead") {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });
  } else if (action === "delete") {
    await prisma.notification.delete({
      where: { id: notificationId, userId: session.user.id },
    });
  }

  return NextResponse.json({ success: true });
}