import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NewCandidatePostClient from "@/components/competition/NewCandidatePostClient";
import { Lock, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function NewCandidatePostPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/concours/nouveau");

  const totalCandidates = await db.competitionEntry.count({
    where: { status: { in: ["PENDING", "APPROVED"] } },
  });

  if (totalCandidates >= 10) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Inscriptions Fermées</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Le nombre maximal de 10 candidats pour le concours de rédaction a été atteint. Suivez les publications et votez pour vos articles préférés !
          </p>
          <Link
            href="/concours/regles"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
          >
            <BookOpen size={16} /> Lire le règlement du concours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Participer au Concours</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Candidats enregistrés : <span className="font-semibold text-blue-600">{totalCandidates}/10</span>. Une fois approuvé, gagnez 1$ immédiatement + jusqu'à 20$ aux 200 likes et 50$ aux 1000 likes !
          </p>
          <p>
            <span className="font-semibold text-gray-900 dark:text-white">Important :</span> apres les 10 candidats, les inscriptions sont toujours ouvers mais plus de prix de bienvunue. mai vous pouvez toujours gagner des prix de likes. <span className="font-semibold text-blue-600">Alors inscrivez-vous vite !</span> 
          </p>
        </div>
        <Link
          href="/concours/regles"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors"
        >
          <BookOpen size={14} /> Voir le Règlement
        </Link>
      </div>

      {/* Composant Client gérant le Formulaire et la Pop-up */}
      <NewCandidatePostClient user={{ name: session.user.name, email: session.user.email }} />
    </div>
  );
}