import { db } from "@/lib/db";
import Link from "next/link";
import { Eye, Heart, Trophy, CheckCircle, XCircle, Award, Users, Lock, Unlock } from "lucide-react";
import ApprovePostButton from "@/components/admin/ApprovePostButton";
import DeletePostButton from "@/components/admin/DeletePostButton";

export const dynamic = "force-dynamic";

export default async function AdminCompetitionPage() {
  const entries = await db.competitionEntry.findMany({
    include: { author: true },
    orderBy: [{ rankWinner: "asc" }, { likes: "desc" }, { createdAt: "desc" }],
  });

  const totalCandidates = entries.filter((e) => e.status !== "REJECTED").length;
  const pendingCount = entries.filter((e) => e.status === "PENDING").length;
  const approvedCount = entries.filter((e) => e.status === "APPROVED").length;
  const totalRewardsGiven = entries.reduce((acc, curr) => acc + curr.rewardAmount, 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="text-amber-500" /> Concours de Rédaction
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Validez les soumissions des 10 candidats, suivez les votes et la distribution des prix.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {totalCandidates >= 10 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-semibold text-xs">
              <Lock size={14} /> Concours Complet (10/10)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold text-xs">
              <Unlock size={14} /> Inscriptions Ouvertes ({totalCandidates}/10)
            </span>
          )}
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Candidats inscrits</span>
            <Users size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalCandidates} / 10</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">En attente de validation</span>
            <CheckCircle size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Articles Approuvés</span>
            <CheckCircle size={18} className="text-green-500" />
          </div>
          <p className="text-2xl font-black text-green-600 dark:text-green-400">{approvedCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Total Primes Distribuées</span>
            <Award size={18} className="text-violet-500" />
          </div>
          <p className="text-2xl font-black text-violet-600 dark:text-violet-400">{totalRewardsGiven}$</p>
        </div>
      </div>

      {/* Tableau des candidatures */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 dark:text-white text-base">Candidatures & Rangings</h2>
          <span className="text-xs text-slate-500">{entries.length} article(s) au total</span>
        </div>

        {entries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            Aucun candidat n'a encore proposé d'article pour le concours.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Candidat / Auteur</th>
                  <th className="py-3 px-4">Titre de l'article</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">J'aime (Progression)</th>
                  <th className="py-3 px-4">Gains Cumulés</th>
                  <th className="py-3 px-4">Date de dépôt</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {entries.map((entry) => {
                  const progressPercentage = Math.min(100, Math.round((entry.likes / 1000) * 100));

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.author.image || "/default-avatar.png"}
                            alt={entry.author.name || "Auteur"}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-white/10"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                              {entry.author.name || "Sans nom"}
                            </p>
                            <p className="text-xs text-slate-400">{entry.author.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-slate-900 dark:text-white truncate">{entry.title}</p>
                          {entry.rankWinner && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              <Trophy size={12} /> Gagnant Rang #{entry.rankWinner}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            entry.status === "APPROVED"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : entry.status === "PENDING"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {entry.status === "APPROVED" ? "Approuvé (+2$)" : entry.status === "PENDING" ? "En attente" : "Refusé"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="w-36 space-y-1">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="flex items-center gap-1 text-rose-500">
                              <Heart size={13} fill="currentColor" /> {entry.likes}
                            </span>
                            <span className="text-slate-400">{progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-rose-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-extrabold text-green-600 dark:text-green-400">
                          {entry.rewardAmount}$
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-500">
                        {new Date(entry.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Bouton pour Approuver / Rejeter */}
                          <ApprovePostButton slug={entry.slug} currentStatus={entry.status} />

                          <Link
                            href={`/concours/${entry.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                            title="Voir l'article"
                          >
                            <Eye size={16} />
                          </Link>

                          <DeletePostButton slug={entry.slug} title={entry.title} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}