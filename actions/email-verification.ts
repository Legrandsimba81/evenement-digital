// actions/email-verification.ts
"use server";

import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/email";
import { auth } from "@/auth";

export async function sendEmailVerification(userId: string, email: string) {
  // Supprimer les anciens tokens non utilisés
  await prisma.emailVerification.deleteMany({
    where: { userId, used: false },
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  await prisma.emailVerification.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  const verifyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email/${token}`;
  await sendVerificationEmail(email, verifyLink);
}

export async function verifyEmail(token: string) {
  const verification = await prisma.emailVerification.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verification || verification.used || verification.expiresAt < new Date()) {
    return { error: "Lien invalide ou expiré." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerification.update({
      where: { id: verification.id },
      data: { used: true },
    }),
  ]);

  return { success: true };
}

export async function resendVerificationEmail() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) throw new Error("Utilisateur non trouvé");

  if (user.emailVerified) {
    throw new Error("Email déjà vérifié.");
  }

  await sendEmailVerification(user.id, user.email);
  return { success: true };
}