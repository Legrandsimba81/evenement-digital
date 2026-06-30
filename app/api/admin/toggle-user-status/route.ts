// app/api/admin/toggle-user-status/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { userId, canCreateEvents } = await req.json();
  await prisma.user.update({
    where: { id: userId },
    data: { canCreateEvents },
  });
  return NextResponse.json({ success: true });
}