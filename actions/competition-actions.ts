"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  sendSubmissionConfirmation,
  sendApprovalEmail,
  sendWinnerNotification,
  notifyParticipantsAboutWinner,
  sendCompetitionClosingEmail,
} from "@/services/email-service";

// 1. Soumission d'une candidature par un candidat
export async function createCandidatePost(data: {
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  imageOrientation?: string;
  images?: string[];
  tags?: string[];
}) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    throw new Error("Non autorisé. Veuillez vous connecter.");
  }

  // Vérification de la limite globale des 10 candidats
  const totalApproved = await db.competitionEntry.count({
    where: { status: { in: ["APPROVED", "PENDING"] } },
  });

  if (totalApproved >= 10) {
    throw new Error("Le quota de 10 candidats pour ce concours est déjà atteint.");
  }

  // Génération d'un slug unique
  const baseSlug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  const newEntry = await db.competitionEntry.create({
    data: {
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt,
      imageUrl: data.imageUrl,
      imageOrientation: data.imageOrientation,
      images: data.images ? data.images : undefined,
      tags: data.tags || [],
      authorId: session.user.id,
      status: "PENDING",
    },
  });

  // Envoi de l'email de confirmation de soumission
  await sendSubmissionConfirmation({
    to: session.user.email,
    authorName: session.user.name || "Candidat",
    title: data.title,
  });

  revalidatePath("/admin/concours");
  return newEntry;
}

// 2. Approbation par l'administrateur (+ crédite les 2$ de départ)
export async function approvePost(slug: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Action réservée aux administrateurs.");

  const entry = await db.competitionEntry.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!entry) throw new Error("Article introuvable.");
  if (entry.status === "APPROVED") return;

  // Transaction : Approuve l'article et ajoute 2$ au solde de l'auteur
  await db.$transaction([
    db.competitionEntry.update({
      where: { slug },
      data: {
        status: "APPROVED",
        published: true,
        publishedAt: new Date(),
        rewardAmount: { increment: 2.0 },
      },
    }),
    db.user.update({
      where: { id: entry.authorId },
      data: {
        balance: { increment: 2.0 },
      },
    }),
  ]);

  // Envoi de l'email d'approbation au candidat
  if (entry.author.email) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://octaviaevent.com";
    const link = `${baseUrl}/concours/${slug}`;

    await sendApprovalEmail({
      to: entry.author.email,
      authorName: entry.author.name || "Candidat",
      title: entry.title,
      link,
    });
  }

  revalidatePath("/admin/concours");
  revalidatePath(`/concours/${slug}`);
}

// 3. Incrémentation des likes et attribution des prix ($50, $20, $10)
export async function toggleLikePost(slug: string) {
  const entry = await db.competitionEntry.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!entry || entry.status !== "APPROVED") throw new Error("Article indisponible.");

  const newLikes = entry.likes + 1;
  let newRank = entry.rankWinner;
  let extraReward = 0;

  // Si l'article atteint 1000 likes pour la première fois
  if (newLikes >= 1000 && !entry.rankWinner) {
    const previousWinnersCount = await db.competitionEntry.count({
      where: { rankWinner: { not: null } },
    });

    if (previousWinnersCount === 0) {
      newRank = 1;
      extraReward = 50.0; // 1er Gagnant
    } else if (previousWinnersCount === 1) {
      newRank = 2;
      extraReward = 20.0; // 2ème Gagnant
    } else if (previousWinnersCount === 2) {
      newRank = 3;
      extraReward = 10.0; // 3ème Gagnant
    }
  }

  // Transaction de mise à jour du classement et de la prime
  await db.$transaction([
    db.competitionEntry.update({
      where: { slug },
      data: {
        likes: newLikes,
        rankWinner: newRank,
        rewardAmount: { increment: extraReward },
      },
    }),
    ...(extraReward > 0
      ? [
          db.user.update({
            where: { id: entry.authorId },
            data: { balance: { increment: extraReward } },
          }),
        ]
      : []),
  ]);

  // Si un nouveau gagnant est désigné lors de ce like
  if (newRank && extraReward > 0) {
    // 1. Notifier le gagnant
    if (entry.author.email) {
      await sendWinnerNotification({
        to: entry.author.email,
        authorName: entry.author.name || "Candidat",
        rank: newRank,
        prize: extraReward,
        title: entry.title,
      });
    }

    // 2. Informer tous les autres participants
    const otherParticipants = await db.user.findMany({
      where: {
        id: { not: entry.authorId },
        competitionEntries: { some: { status: "APPROVED" } },
      },
      select: { email: true },
    });

    const otherEmails = otherParticipants.map((p) => p.email).filter(Boolean) as string[];

    if (otherEmails.length > 0) {
      await notifyParticipantsAboutWinner({
        participantsEmails: otherEmails,
        winnerName: entry.author.name || "Un candidat",
        rank: newRank,
        prize: extraReward,
      });
    }
  }

  revalidatePath(`/concours/${slug}`);
  revalidatePath("/admin/concours");
}

// 4. Action de clôture du concours et envoi du bilan final
export async function closeCompetitionAndNotify() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Action réservée aux administrateurs.");

  // Récupération de tous les candidats ayant participé
  const participants = await db.user.findMany({
    where: { competitionEntries: { some: { status: "APPROVED" } } },
    select: { email: true, name: true },
  });

  // Récupération des gagnants (rangs 1, 2, 3)
  const winnersEntries = await db.competitionEntry.findMany({
    where: { rankWinner: { not: null } },
    orderBy: { rankWinner: "asc" },
    include: { author: true },
  });

  const formattedWinners = winnersEntries.map((w) => ({
    name: w.author.name || "Candidat",
    rank: w.rankWinner!,
    prize: w.rankWinner === 1 ? 50 : w.rankWinner === 2 ? 20 : 10,
    title: w.title,
  }));

  const validParticipants = participants
    .filter((p) => p.email)
    .map((p) => ({ email: p.email!, name: p.name || "Participant" }));

  await sendCompetitionClosingEmail({
    participants: validParticipants,
    winners: formattedWinners,
  });

  return { success: true, count: validParticipants.length };
}