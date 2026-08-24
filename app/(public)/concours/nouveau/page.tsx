import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CandidatePostForm from "@/components/competition/CandidatePostForm";
import { Lock } from "lucide-react";

export default async function NewCandidatePostPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/concours/nouveau");

  // Remplacement de db.blogPost par db.competitionEntry
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
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Le nombre maximal de 10 candidats pour le concours de rédaction a été atteint. Suivez les publications et votez pour vos articles préférés !
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Participer au Concours</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Candidats enregistrés : <span className="font-semibold text-blue-600">{totalCandidates}/10</span>. Une fois approuvé, gagnez 2$ immédiatement + jusqu'à 50$ aux 1000 likes !
        </p>
      </div>
      <CandidatePostForm />
    </div>
  );
}