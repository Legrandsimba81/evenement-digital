"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;

  if (!email || !password || !name || !phone) {
    return { error: "Tous les champs sont obligatoires." };
  }

  // Validation du téléphone
  if (!/^0\d{9}$/.test(phone)) {
    return { error: "Le numéro de téléphone doit contenir 10 chiffres et commencer par 0." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Cet email est déjà utilisé." };
  }

  const existingPhone = await prisma.user.findUnique({ where: { phone } });
  if (existingPhone) {
    return { error: "Ce numéro de téléphone est déjà utilisé." };
  }

  const hashed = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      phone,
      role: "USER",
    },
  });

  // Envoyer l'email de bienvenue
  await sendWelcomeEmail(email, name || "Utilisateur");

  // Générer un token de vérification d'email
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  await prisma.emailVerification.create({
    data: {
      token,
      userId: newUser.id,
      expiresAt,
    },
  });

  const verifyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email/${token}`;
  await sendVerificationEmail(email, verifyLink);

  return { success: true };
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Aucun compte avec cet email." };
  }

  // Si l'utilisateur n'a pas de mot de passe (compte Google)
  if (!user.password) {
    return { error: "Cet utilisateur utilise Google pour se connecter. Veuillez vous connecter avec Google." };
  }

  // Supprimer les anciens tokens non utilisés
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, used: false },
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 heure

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${token}`;
  await sendPasswordResetEmail(user.email, resetLink);

  return { success: true };
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
    return { error: "Token invalide ou expiré." };
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashed },
  });

  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { used: true },
  });

  return { success: true };
}