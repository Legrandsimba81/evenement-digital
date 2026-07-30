import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { phone } = await request.json();
  if (!phone) {
    return NextResponse.json({ error: "Numéro de téléphone requis" }, { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { phone },
    });
    return NextResponse.json({ success: true, message: "Téléphone mis à jour" });
  } catch (error) {
    console.error("Erreur update phone:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}