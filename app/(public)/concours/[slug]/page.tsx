import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { Calendar, Eye, Clock, Award, Trophy, BadgeCheck, PlusCircle, Edit3, MessageSquare, AlertOctagon } from "lucide-react";
import CommentSection from "@/components/competition/CommentSection";
import ShareModal from "@/components/competition/ShareModal";
import LikeButton from "@/components/competition/LikeButton";
import { Metadata } from "next";
import Link from "next/link";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    const post = await db.competitionEntry.findUnique({
        where: { slug },
    });

    if (!post || post.status !== "APPROVED") {
        return {
            title: "Article non trouvé | Concours",
        };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.octaviaevent.com/";
    const postUrl = `${baseUrl}/concours/${slug}`;
    const description = post.excerpt || post.content.replace(/<[^>]*>/g, "").slice(0, 160);
    const imageUrl = post.imageUrl || `${baseUrl}/og-image.png`;

    return {
        title: `${post.title} | Concours de Rédaction`,
        description,
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            title: post.title,
            description,
            url: postUrl,
            siteName: "Octavia Event",
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
            locale: "fr_FR",
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function CompetitionPostPage({ params }: Props) {
    const { slug } = await params;
    const session = await auth();

    // Vérifier si le concours est actuellement suspendu
    const settings = await db.competitionSettings.findUnique({
        where: { id: "global" },
    });
    const isSuspended = settings?.isSuspended || false;

    // Sélection complète des champs du commentaire et de la relation user
    const post = await db.competitionEntry.findUnique({
        where: { slug },
        include: { 
            author: true,
            comments: {
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    userId: true,
                    user: {
                        select: { name: true }
                    }
                }
            }
        },
    });

    if (!post || post.status !== "APPROVED") return notFound();

    // Vérification des droits du propriétaire ou admin
    const isOwner = session?.user?.id === post.authorId;
    const isAdmin = session?.user?.role === "ADMIN";
    const canEdit = isOwner || isAdmin;

    // Vérifier si l'utilisateur connecté a déjà aimé cet article
    let likedByCurrentUser = false;
    if (session?.user?.id) {
        const existingLike = await db.competitionLike.findFirst({
            where: {
                postId: post.id,
                userId: session.user.id,
            },
        });
        likedByCurrentUser = !!existingLike;
    }

    // Incrémentation des vues
    await db.competitionEntry.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
    });

    const publishedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : "Non disponible";

    const publishedTime = post.publishedAt
        ? new Date(post.publishedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        : "";

    const commentsCount = post.comments?.length || 0;

    // Formater le tableau des commentaires
    const formattedComments = post.comments.map((c) => ({
        id: c.id,
        content: c.content,
        authorName: c.user?.name || "Anonyme",
        authorId: c.userId,
        createdAt: c.createdAt,
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 py-6 px-3 sm:py-12 sm:px-6 transition-colors">
            
            {/* Bandeau d'état : Alerte suspension OU Appel à participation standard */}
            {isSuspended ? (
                <div className="max-w-4xl mx-auto mb-8 p-6 bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl text-center space-y-2 backdrop-blur-md">
                    <div className="inline-flex items-center justify-center p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20 mb-1">
                        <AlertOctagon size={28} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-300">
                        Concours Temporairement Suspendu
                    </h2>
                    <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 max-w-2xl mx-auto leading-relaxed">
                        {settings?.reason || "Le concours est temporairement mis en pause par l'administration par manque d'implication de plusieurs candidats. Les votes et participations sont momentanément désactivés."}
                    </p>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto mb-6 px-4 text-center">
                    <Link
                        href="/concours/regles"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl transition-all shadow-md shadow-blue-600/20"
                    >
                        <PlusCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">Participer au concours et gagner 50$ !</span>
                    </Link>
                </div>
            )}

            <article className="max-w-4xl mx-auto">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/80 dark:border-gray-800 p-4 sm:p-8 md:p-10">

                    {/* Option de modification pour l'auteur ou l'admin */}
                    {canEdit && (
                        <div className="mb-6 flex justify-end">
                            <Link
                                href={`/concours/edit/${post.slug}`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
                            >
                                <Edit3 size={16} />
                                Modifier l'article
                            </Link>
                        </div>
                    )}

                    {/* Badge Gagnant */}
                    {post.rankWinner && (
                        <div className="mb-6 inline-flex items-center gap-2 bg-amber-500 text-white font-extrabold px-4 py-2 rounded-2xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm">
                            <Trophy size={18} /> Gagnant Rang #{post.rankWinner} - Prix de {post.rankWinner === 1 ? "50$" : post.rankWinner === 2 ? "20$" : "10$"}
                        </div>
                    )}

                    {/* En-tête Auteur & Cagnotte */}
                    <div className="flex flex-wrap items-center justify-between gap-1 md:gap-4 border-b border-gray-200/70 dark:border-gray-800 pb-6 mb-6">
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                            <img
                                src={post.author.image || "/default-avatar.png"}
                                alt={post.author.name || "Auteur"}
                                className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover"
                            />
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                                        {post.author.name || "Candidat"}
                                    </h3>
                                    <BadgeCheck size={18} className="fill-blue-500 stroke-white flex-shrink-0" />
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={13} /> {publishedDate}
                                    </span>
                                    {publishedTime && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={13} /> à {publishedTime}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-right ml-auto sm:ml-0 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/50 px-3 py-1.5 rounded-2xl">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-green-700 dark:text-green-400 block">
                                Cagnotte <br /> Candidat
                            </span>
                            <span className="text-lg sm:text-xl font-black text-green-600 dark:text-green-400 flex items-center justify-end gap-1">
                                <Award size={18} /> {post.rewardAmount}$
                            </span>
                        </div>
                    </div>

                    {/* Image de couverture */}
                    <div
                        className={`w-full rounded-2xl overflow-hidden mb-8 shadow-md border border-gray-100 dark:border-gray-800 ${post.imageOrientation === "portrait" ? "max-w-md mx-auto aspect-[3/4]" : "aspect-[16/9]"
                            }`}
                    >
                        <img
                            src={post.imageUrl || "/images/default-cover.jpg"}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Titre, Extrait & Métriques */}
                    <header className="mb-6">
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                            {post.title}
                        </h1>

                        {post.excerpt && (
                            <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                {post.excerpt}
                            </p>
                        )}

                        {/* Barre d'interaction immédiate */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                {!isSuspended ? (
                                    <LikeButton
                                        postSlug={slug}
                                        initialLikes={post.likes}
                                        likedByCurrentUser={likedByCurrentUser}
                                    />
                                ) : (
                                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800">
                                        Votes suspendus ({post.likes} J'aime)
                                    </span>
                                )}
                                <ShareModal postSlug={slug} title={post.title} />
                            </div>

                            <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1.5 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <Eye size={16} /> {post.views} vues
                                </span>
                                <a
                                    href="#comments"
                                    className="flex items-center gap-1.5 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition"
                                >
                                    <MessageSquare size={16} /> {commentsCount} commentaires
                                </a>
                            </div>
                        </div>
                    </header>

                    {/* Contenu Rich Text */}
                    <div
                        className="mt-6 prose prose-slate sm:prose-lg dark:prose-invert max-w-none break-words leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Galerie d'images secondaires */}
                    {Array.isArray(post.images) && post.images.length > 0 && (
                        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(post.images as string[]).map((imgUrl, idx) => (
                                <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                                    <img src={imgUrl} alt={`Illustration ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Section Commentaires */}
                    <div id="comments" className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                        <CommentSection postSlug={slug} comments={formattedComments} />
                    </div>

                </div>
            </article>
        </div>
    );
}