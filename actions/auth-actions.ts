"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { sendWelcomeEmail } from "@/lib/email";
import { sendEmailVerification } from "@/actions/email-verification";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;

    if (!email || !password || !name || !phone) {
      return { error: "Tous les champs sont obligatoires." };
    }

    if (!/^0\d{9}$/.test(phone)) {
      return { error: "Le numéro de téléphone doit contenir 10 chiffres et commencer par 0." };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: "Cet email est déjà utilisé." };

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) return { error: "Ce numéro de téléphone est déjà utilisé." };

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        phone,
        role: "USER",
        emailVerified: null, // L'email reste non vérifié au départ
      },
    });

    // Envoi de l'email de bienvenue
    try {
      await sendWelcomeEmail(email, name || "Utilisateur");
    } catch (err) {
      console.error("Erreur envoi bienvenue:", err);
    }

    // Envoi de l'email de vérification
    try {
      await sendEmailVerification(newUser.id, email);
    } catch (err) {
      console.error("Erreur envoi vérification:", err);
      return {
        success: true,
        warning: "Compte créé, mais l'email de vérification n'a pas pu être envoyé. Contactez le support.",
      };
    }

    return {
      success: true,
      message: "Un email de vérification vous a été envoyé. Veuillez valider votre compte avant de vous connecter.",
    };
  } catch (error: any) {
    console.error("Erreur registerUser:", error);
    return { error: error.message || "Erreur lors de l'inscription." };
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "Aucun compte avec cet email." };
    if (!user.password) {
      return { error: "Cet utilisateur utilise Google. Connectez-vous avec Google." };
    }

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, used: false },
    });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const resetLink = `${BASE_URL}/reset-password/${token}`;

    await fetch(`${BASE_URL}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "reset",
        to: email,
        data: { resetLink },
      }),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Erreur requestPasswordReset:", error);
    return { error: "Erreur lors de l'envoi de l'email de réinitialisation." };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
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
  } catch (error: any) {
    console.error("Erreur resetPassword:", error);
    return { error: "Erreur lors de la réinitialisation." };
  }
}