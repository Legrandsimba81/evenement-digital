"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendCompetitionSuspensionEmail } from "@/lib/email";

export async function toggleCompetitionSuspension(isSuspended: boolean, reason?: string) {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  // Mettre à jour la configuration du concours
  await db.competitionSettings.upsert({
    where: { id: "global" },
    update: { isSuspended, reason },
    create: { id: "global", isSuspended, reason },
  });

  // Si le concours est suspendu, notifier l'ensemble des candidats
  if (isSuspended) {
    const candidates = await db.competitionEntry.findMany({
      select: {
        author: {
          select: { email: true, name: true },
        },
      },
    });

    // Éliminer les doublons d'e-mails
    const uniqueEmails = Array.from(
      new Map(candidates.map((c) => [c.author.email, c.author])).values()
    );

    // Envoi séquentiel des e-mails via Nodemailer
    for (const candidate of uniqueEmails) {
      if (candidate.email) {
        try {
          await sendCompetitionSuspensionEmail(
            candidate.email, 
            candidate.name || "Candidat", 
            reason
          );
        } catch (error) {
          console.error(`Erreur d'envoi d'email de suspension à ${candidate.email}:`, error);
        }
      }
    }
  }

  revalidatePath("/admin/concours");
  revalidatePath("/concours/[slug]", "page");

  return { success: true, isSuspended };
}