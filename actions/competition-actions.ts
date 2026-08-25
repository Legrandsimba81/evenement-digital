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
    sendPostReceivedNoBonusEmail,
} from "@/services/email-service";

// -----------------------------------------------------------------------------
// 1. Soumission d'une candidature par un candidat
// -----------------------------------------------------------------------------
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

    await sendSubmissionConfirmation({
        to: session.user.email,
        authorName: session.user.name || "Candidat",
        title: data.title,
    });

    revalidatePath("/concours");
    revalidatePath("/admin/concours");

    return { success: true, slug: newEntry.slug };
}

// -----------------------------------------------------------------------------
// 2. Approbation par l'administrateur (1$ seulement pour les 10 premiers)
// -----------------------------------------------------------------------------
export async function approvePost(slug: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Action réservée aux administrateurs.");

    const entry = await db.competitionEntry.findUnique({
        where: { slug },
        include: { author: true },
    });

    if (!entry) throw new Error("Article introuvable.");
    if (entry.status === "APPROVED") return;

    const approvedCount = await db.competitionEntry.count({
        where: { status: "APPROVED" },
    });

    const isEligibleForWelcomeBonus = approvedCount < 10;
    const bonusAmount = isEligibleForWelcomeBonus ? 1.0 : 0.0;

    await db.$transaction([
        db.competitionEntry.update({
            where: { slug },
            data: {
                status: "APPROVED",
                published: true,
                publishedAt: new Date(),
                rewardAmount: { increment: bonusAmount },
            },
        }),
        ...(bonusAmount > 0
            ? [
                db.user.update({
                    where: { id: entry.authorId },
                    data: {
                        balance: { increment: bonusAmount },
                    },
                }),
            ]
            : []),
    ]);

    if (entry.author.email) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://octaviaevent.com";
        const link = `${baseUrl}/concours/${slug}`;

        if (isEligibleForWelcomeBonus) {
            await sendApprovalEmail({
                to: entry.author.email,
                authorName: entry.author.name || "Candidat",
                title: entry.title,
                link,
            });
        } else {
            await sendPostReceivedNoBonusEmail({
                to: entry.author.email,
                authorName: entry.author.name || "Candidat",
                title: entry.title,
                link,
            });
        }
    }

    revalidatePath("/concours");
    revalidatePath(`/concours/${slug}`);
    revalidatePath("/admin/concours");
}

// -----------------------------------------------------------------------------
// 3. Rejet d'un article par l'administrateur
// -----------------------------------------------------------------------------
export async function rejectPost(slug: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Action réservée aux administrateurs.");

    await db.competitionEntry.update({
        where: { slug },
        data: { status: "REJECTED", published: false },
    });

    revalidatePath("/concours");
    revalidatePath(`/concours/${slug}`);
    revalidatePath("/admin/concours");
}

// -----------------------------------------------------------------------------
// 4. Gestion des Likes et Attribution des Prix (200 likes = 20$, 1000 likes = $50, $20, $10)
// -----------------------------------------------------------------------------
export async function toggleLikePost(slug: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Vous devez être connecté pour voter.");
    }

    const userId = session.user.id;

    const entry = await db.competitionEntry.findUnique({
        where: { slug },
        include: { author: true },
    });

    if (!entry || entry.status !== "APPROVED") {
        throw new Error("Article indisponible.");
    }

    const existingLike = await db.competitionLike.findUnique({
        where: {
            postId_userId: {
                postId: entry.id,
                userId: userId,
            },
        },
    });

    let isLiked = false;
    let updatedLikesCount = entry.likes;

    if (existingLike) {
        // --- SUPPRESSION DU LIKE ---
        updatedLikesCount = Math.max(0, entry.likes - 1);

        await db.$transaction([
            db.competitionLike.delete({
                where: { id: existingLike.id },
            }),
            db.competitionEntry.update({
                where: { id: entry.id },
                data: { likes: { decrement: 1 } },
            }),
        ]);

        isLiked = false;
    } else {
        // --- AJOUT DU LIKE ---
        updatedLikesCount = entry.likes + 1;
        let newRank = entry.rankWinner;
        let isFirstTo200 = entry.firstTo200;
        let extraReward = 0;

        // REGLE A : Premier article à atteindre 200 Likes (Bonus Unique 20$)
        if (updatedLikesCount >= 200 && !entry.firstTo200) {
            const any200Winner = await db.competitionEntry.count({
                where: { firstTo200: true },
            });

            if (any200Winner === 0) {
                isFirstTo200 = true;
                extraReward += 20.0;
            }
        }

        // REGLE B : Classement des 3 premiers articles à atteindre 1000 Likes ($50, $20, $10)
        if (updatedLikesCount >= 1000 && !entry.rankWinner) {
            const previous1000WinnersCount = await db.competitionEntry.count({
                where: { rankWinner: { not: null } },
            });

            if (previous1000WinnersCount === 0) {
                newRank = 1;
                extraReward += 50.0;
            } else if (previous1000WinnersCount === 1) {
                newRank = 2;
                extraReward += 20.0;
            } else if (previous1000WinnersCount === 2) {
                newRank = 3;
                extraReward += 10.0;
            }
        }

        await db.$transaction([
            db.competitionLike.create({
                data: {
                    postId: entry.id,
                    userId: userId,
                },
            }),
            db.competitionEntry.update({
                where: { id: entry.id },
                data: {
                    likes: { increment: 1 },
                    firstTo200: isFirstTo200,
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

        isLiked = true;

        // Envoi des emails si une récompense à été débloquée
        if (extraReward > 0) {
            if (entry.author.email) {
                await sendWinnerNotification({
                    to: entry.author.email,
                    authorName: entry.author.name || "Candidat",
                    rank: newRank || 0,
                    prize: extraReward,
                    title: entry.title,
                });
            }

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
                    rank: newRank || 0,
                    prize: extraReward,
                });
            }
        }
    }

    revalidatePath("/concours");
    revalidatePath(`/concours/${slug}`);
    revalidatePath("/admin/concours");

    return { liked: isLiked, likes: updatedLikesCount };
}

// -----------------------------------------------------------------------------
// 5. Gestion des Commentaires (Ajout & Edition)
// -----------------------------------------------------------------------------
export async function addCompetitionComment(
    postSlug: string,
    authorName: string,
    content: string,
    authorId?: string
) {
    const entry = await db.competitionEntry.findUnique({
        where: { slug: postSlug },
        select: { id: true },
    });

    if (!entry) throw new Error("Article du concours introuvable.");

    const comment = await db.blogComment.create({
        data: {
            content,
            authorName,
            authorId: authorId || null,
            postId: entry.id,
        },
    });

    revalidatePath(`/concours/${postSlug}`);
    return comment;
}

export async function updateCompetitionComment(commentId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé.");

    const existingComment = await db.blogComment.findUnique({
        where: { id: commentId },
    });

    if (!existingComment || existingComment.authorId !== session.user.id) {
        throw new Error("Vous ne pouvez pas modifier ce commentaire.");
    }

    const updated = await db.blogComment.update({
        where: { id: commentId },
        data: { content },
    });

    return updated;
}

// -----------------------------------------------------------------------------
// 6. Action de clôture du concours et envoi du bilan final
// -----------------------------------------------------------------------------
export async function closeCompetitionAndNotify() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Action réservée aux administrateurs.");

    const participants = await db.user.findMany({
        where: { competitionEntries: { some: { status: "APPROVED" } } },
        select: { email: true, name: true },
    });

    const winnersEntries = await db.competitionEntry.findMany({
        where: { OR: [{ rankWinner: { not: null } }, { firstTo200: true }] },
        orderBy: { rankWinner: "asc" },
        include: { author: true },
    });

    const formattedWinners = winnersEntries.map((w) => ({
        name: w.author.name || "Candidat",
        rank: w.rankWinner || 0,
        prize: w.rewardAmount,
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

// -----------------------------------------------------------------------------
// 7. Suppression d'une candidature par l'admin
// -----------------------------------------------------------------------------
export async function deleteCandidatePost(id: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Action réservée aux administrateurs.");
    }

    await db.$transaction([
        db.competitionLike.deleteMany({
            where: { postId: id },
        }),
        db.competitionEntry.delete({
            where: { id },
        }),
    ]);

    revalidatePath("/concours");
    revalidatePath("/admin/concours");
    return { success: true };
}