import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import CandidatePostForm from "@/components/competition/CandidatePostForm";

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditCandidatePostPage({ params }: EditPageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const entry = await db.competitionEntry.findUnique({
    where: { slug },
  });

  if (!entry) {
    notFound();
  }

  // Vérification de sécurité : Seul l'auteur ou l'admin peut modifier
  const isAuthor = entry.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Modifier mon article
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Apportez vos modifications ci-dessous puis validez l'enregistrement.
        </p>
      </div>

      <CandidatePostForm
        authorName={session.user.name || undefined}
        authorImage={session.user.image || undefined}
        initialData={entry}
      />
    </main>
  );
}