import { db } from "@/lib/db";
import Link from "next/link";
import { BadgeCheck, Heart, Eye, Trophy, PlusCircle, ArrowRight, PenTool, Gift, Info } from "lucide-react";

export const revalidate = 0; // Contenu dynamique toujours à jour

export default async function CompetitionListPage() {
    const posts = await db.competitionEntry.findMany({
        where: { status: "APPROVED" },
        include: { author: true },
        orderBy: [
            { rankWinner: "asc" }, // Affiche les gagnants en premier si disponibles
            { likes: "desc" },     // Puis trie par nombre de likes
            { createdAt: "desc" },
        ],
    });

    const totalApproved = await db.competitionEntry.count({
        where: { status: "APPROVED" },
    });

    const totalCandidates = await db.competitionEntry.count({
        where: { status: { in: ["APPROVED", "PENDING"] } },
    });

    const isBonusAvailable = totalApproved < 10;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 py-10 px-4 md:py-14 md:px-8">
            <div className="max-w-7xl mx-auto">

                {/* En-tête de la page */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 border-b border-gray-200 dark:border-gray-800 pb-8">
                    <div>
                        <h1 className="text-2xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                            Concours de Rédaction
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base max-w-2xl">
                            Découvrez les articles des candidats retenus, lisez leurs productions et votez pour soutenir vos auteurs préférés !
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Bouton Participer & Créer un article (Toujours disponible) */}
                        {/* <Link
                            href="/concours/nouveau"
                            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-95 shrink-0"
                        >
                            <PenTool size={20} />
                            <span>Rédiger un article</span>
                        </Link> */}
                    </div>
                </div>

                {/* Petite Alerte sur l'éligibilité au Bonus de 1$ */}
                <div className="mb-10">
                    {isBonusAvailable ? (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm">
                            <Gift size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <p>
                                <strong className="font-bold">Bonus de bienvenue actif :</strong> Plus que{" "}
                                <span className="font-extrabold underline">{10 - totalApproved} place(s)</span> pour faire partie des 10 premiers candidats et recevoir automatiquement <strong className="font-bold">1.0$</strong> à la publication de votre article !
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
                            <Info size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            <p>
                                <strong className="font-bold">Note d'information :</strong> Le quota des 10 premiers articles gratifiés du bonus de bienvenue (1$) est atteint. Vous pouvez toujours rédiger votre article pour concourir et tenter de gagner les grands prix du concours (<strong className="font-bold">50$</strong>, <strong className="font-bold">20$</strong>, <strong className="font-bold">10$</strong> et le bonus de <strong className="font-bold">20$</strong> au 1er à 200 likes) !
                            </p>
                        </div>
                    )}
                </div>

                {/* Grille des articles */}
                {posts.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 max-w-lg mx-auto">
                        <Trophy size={48} className="mx-auto text-amber-500 mb-4 opacity-80" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Aucun article publié pour le moment</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
                            Les candidatures sont en cours de modération. Soyez le premier à poster votre rédaction !
                        </p>

                        <Link
                            href="/concours/nouveau"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md shadow-blue-600/20"
                        >
                            <PlusCircle size={18} />
                            Participer au concours
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {posts.map((post) => (
                            <article
                                key={post.id}
                                className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-200/80 dark:border-gray-800 shadow-md hover:shadow-xl dark:hover:shadow-gray-800/50 transition-all duration-300 flex flex-col"
                            >
                                {/* Image de couverture */}
                                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    {post.imageUrl ? (
                                        <img
                                            src={post.imageUrl || "/images/default-cover.jpg"}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 font-bold text-lg">
                                            Concours
                                        </div>
                                    )}

                                    {/* Badge Rang de Gagnant */}
                                    {post.rankWinner && (
                                        <div className="absolute top-3 left-3 bg-amber-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1">
                                            <Trophy size={14} /> #{post.rankWinner} Gagnant
                                        </div>
                                    )}

                                    {/* Solde accumulé */}
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-emerald-400 font-extrabold text-xs px-3 py-1.5 rounded-xl border border-white/10">
                                        {post.rewardAmount}$
                                    </div>
                                </div>

                                {/* Contenu */}
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        {/* Infos Auteur avec BadgeCheck */}
                                        <Link
                                            href={`/concours/${post.slug}`}
                                            className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform"
                                        >
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <img
                                                    src={post.author.image || "/default-avatar.png"}
                                                    alt={post.author.name || "Auteur"}
                                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
                                                />
                                                <div className="flex items-center gap-1 min-w-0">
                                                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                                        {post.author.name || "Candidat"}
                                                    </span>
                                                    <BadgeCheck size={18} className="fill-blue-500 stroke-white flex-shrink-0" />
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Titre & Extrait */}
                                        <Link href={`/concours/${post.slug}`}>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug mb-2">
                                                {post.title}
                                            </h2>
                                        </Link>
                                        {post.excerpt && (
                                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                                                {post.excerpt}
                                            </p>
                                        )}
                                    </div>

                                    {/* Pied de carte avec statistiques et action */}
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1 font-medium">
                                                <Heart size={15} className="text-rose-500 fill-rose-500/20" /> {post.likes}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye size={15} /> {post.views}
                                            </span>
                                        </div>

                                        <Link
                                            href={`/concours/${post.slug}`}
                                            className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform"
                                        >
                                            Lire l'article <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}