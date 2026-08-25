import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowLeft, Edit3 } from "lucide-react";

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompetitionPreviewPage({ params }: PreviewPageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const entry = await db.competitionEntry.findUnique({
    where: { slug },
    include: {
      author: {
        select: { name: true, image: true },
      },
    },
  });

  if (!entry) {
    notFound();
  }

  // 1. Vérification de sécurité : Seul l'auteur ou l'admin peut prévisualiser
  const isAuthor = entry.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    notFound();
  }

  // 2. Si l'article est déjà approuvé, on redirige vers l'URL publique de l'article
  if (entry.status === "APPROVED") {
    redirect(`/concours/${entry.slug}`);
  }

  // 3. Si l'article est rejeté (ou autre statut non-PENDING), on masque la page
  if (entry.status !== "PENDING") {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Bannière de Statut En Attente avec bouton de modification */}
      <div className="mb-8 p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Clock className="w-6 h-6 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h3 className="font-bold text-base">Candidature en cours de modération</h3>
            <p className="text-sm text-amber-800 dark:text-amber-300/90 mt-0.5">
              Votre article a bien été reçu. Il est actuellement révisé par notre équipe. 
              Vous pouvez encore modifier son contenu tant qu'il n'est pas validé.
            </p>
          </div>
        </div>

        {/* Bouton de modification rapide */}
        <Link
          href={`/concours/edit/${entry.slug}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition shrink-0 shadow-sm"
        >
          <Edit3 className="w-4 h-4" />
          Modifier l'article
        </Link>
      </div>

      {/* Navigation retour et action d'édition */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/concours"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux articles
        </Link>

        <Link
          href={`/concours/edit/${entry.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <Edit3 className="w-4 h-4" />
          Éditer
        </Link>
      </div>

      {/* Rendu de l'article en aperçu */}
      <article className="space-y-6">
        <div className="space-y-3">
          <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded-full border border-amber-200 dark:border-amber-900/40">
            Aperçu avant publication
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
            {entry.title}
          </h1>
          
          <div className="flex items-center gap-3 pt-1">
            {entry.author.image && (
              <img
                src={entry.author.image}
                alt={entry.author.name || "Auteur"}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Par <span className="font-semibold text-gray-900 dark:text-white">{entry.author.name}</span>
            </p>
          </div>
        </div>

        {entry.imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
            <Image
              src={entry.imageUrl}
              alt={entry.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Extrait s'il existe */}
        {entry.excerpt && (
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300 italic border-l-4 border-amber-500 pl-4 py-1">
            {entry.excerpt}
          </p>
        )}

        {/* Contenu Rich Text */}
        <div 
          className="prose prose-neutral dark:prose-invert max-w-none pt-4"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      </article>
    </main>
  );
}