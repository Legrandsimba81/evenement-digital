"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || !name) {
    return { error: "Tous les champs sont requis." };
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email, password: hashed, role: "USER" },
    });
    redirect("/login");
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Cet email est déjà utilisé. Veuillez vous connecter." };
    }
    throw e;
  }
}