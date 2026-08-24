import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Calendar, Eye, Clock, Award, Trophy, BadgeCheck, PlusCircle, } from "lucide-react";
import CommentSection from "@/components/blog/CommentSection";
import ShareModal from "@/components/competition/ShareModal";
import LikeButton from "@/components/competition/LikeButton";
import { Metadata } from "next";
import Link from "next/link";

interface Props {
    params: Promise<{ slug: string }>;
}

// Génération dynamique des métadonnées pour Google et WhatsApp (OpenGraph)
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

    const post = await db.competitionEntry.findUnique({
        where: { slug },
        include: { author: true },
    });

    if (!post || post.status !== "APPROVED") return notFound();

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 py-6 px-3 sm:py-12 sm:px-6 transition-colors">
            <div className="max-w-4xl mx-auto mb-6 text-center">
                <Link
                    href="/concours/regles"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md shadow-blue-600/20"
                >
                    <PlusCircle size={18} />
                    lire le règlement du concours
                </Link>
            </div>
            <article className="max-w-4xl mx-auto">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/80 dark:border-gray-800 p-4 sm:p-8 md:p-10">

                    {/* Badge Gagnant */}
                    {post.rankWinner && (
                        <div className="mb-6 inline-flex items-center gap-2 bg-amber-500 text-white font-extrabold px-4 py-2 rounded-2xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm">
                            <Trophy size={18} /> Gagnant Rang #{post.rankWinner} - Prix de {post.rankWinner === 1 ? "50$" : post.rankWinner === 2 ? "20$" : "10$"}
                        </div>
                    )}

                    {/* En-tête Auteur & Cagnotte */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/70 dark:border-gray-800 pb-6 mb-6">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <img
                                src={post.author.image || "/default-avatar.png"}
                                alt={post.author.name || "Auteur"}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-blue-500/30"
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
                                Cagnotte Candidat
                            </span>
                            <span className="text-lg sm:text-xl font-black text-green-600 dark:text-green-400 flex items-center justify-end gap-1">
                                <Award size={18} /> {post.rewardAmount}$
                            </span>
                        </div>
                    </div>

                    {/* Image de couverture */}
                    {post.imageUrl && (
                        <div
                            className={`w-full rounded-2xl overflow-hidden mb-8 shadow-md border border-gray-100 dark:border-gray-800 ${post.imageOrientation === "portrait" ? "max-w-md mx-auto aspect-[3/4]" : "aspect-[16/9]"
                                }`}
                        >
                            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Titre & Vues */}
                    <header className="mb-6">
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-4">
                            <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                <Eye size={15} /> {post.views} vues
                            </span>
                        </div>
                    </header>

                    {/* Contenu Rich Text */}
                    <div
                        className="mt-6 prose prose-slate sm:prose-lg dark:prose-invert max-w-none break-words leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Galerie d'images secondaires si présentes */}
                    {Array.isArray(post.images) && post.images.length > 0 && (
                        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(post.images as string[]).map((imgUrl, idx) => (
                                <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                                    <img src={imgUrl} alt={`Illustration ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Barre d'actions (Like & Partage) */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-10 border-t border-gray-200 dark:border-gray-800 pt-6">
                        <LikeButton postSlug={slug} initialLikes={post.likes} />
                        <ShareModal postSlug={slug} title={post.title} />
                    </div>

                    {/* Section Commentaires */}
                    <CommentSection postSlug={slug} comments={[]} />
                </div>
            </article>
        </div>
    );
}