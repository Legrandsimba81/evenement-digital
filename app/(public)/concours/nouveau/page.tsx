import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NewCandidatePostClient from "@/components/competition/NewCandidatePostClient";
import { BookOpen, Gift, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function NewCandidatePostPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/concours/nouveau");

  const totalCandidates = await db.competitionEntry.count({
    where: { status: { in: ["PENDING", "APPROVED"] } },
  });

  // Déterminer si le candidat bénéficie du bonus de bienvenue (10 premiers)
  const isEligibleForWelcomeBonus = totalCandidates < 10;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Participer au Concours</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Candidats enregistrés : <span className="font-bold text-blue-600">{totalCandidates}</span>
          </p>
        </div>
        <Link
          href="/concours/regles"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors"
        >
          <BookOpen size={14} /> Voir le Règlement
        </Link>
      </div>

      {/* Message indicatif selon le statut d'éligibilité au bonus */}
      {isEligibleForWelcomeBonus ? (
        <div className="mb-6 p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/60 flex items-start gap-3">
          <Gift className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-green-800 dark:text-green-300">
            <span className="font-bold">Félicitations !</span> Vous faites partie des 10 premiers candidats ({totalCandidates}/10). Une fois votre article approuvé, vous recevrez <span className="font-bold">1$ de bienvenue immédiat</span> + l'accès à l'ensemble des prix de la compétition (jusqu'à 50$).
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
            <span className="font-bold">Inscriptions toujours ouvertes !</span> Le quota des 10 premiers candidats est atteint, le bonus de bienvenue de 1$ n'est donc plus disponible. Cependant, <span className="font-bold">vous restez totalement éligible à tous les grands prix du concours</span> (jusqu'à 50$ selon vos résultats).
          </p>
        </div>
      )}

      {/* Composant Client gérant le Formulaire et la Pop-up */}
      <NewCandidatePostClient 
        user={{ name: session.user.name, email: session.user.email }} 
        isEligibleForWelcomeBonus={isEligibleForWelcomeBonus}
      />
    </div>
  );
}