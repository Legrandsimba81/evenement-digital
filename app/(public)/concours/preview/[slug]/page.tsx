import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";

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
      {/* Bannière de Statut En Attente */}
      <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-start gap-3">
        <Clock className="w-6 h-6 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-base">Candidature en cours de modération</h3>
          <p className="text-sm opacity-90 mt-1">
            Votre article a bien été reçu. Il est actuellement révisé par notre équipe.
            Une fois approuvé, il sera publié officiellement et vous pourrez commencer à récolter des votes !
          </p>
        </div>
      </div>

      {/* Navigation retour */}
      <div className="mb-6">
        <Link
          href="/concours"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux articles
        </Link>
      </div>

      {/* Rendu de l'article en aperçu */}
      <article className="space-y-6 opacity-90">
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-medium rounded-full">
            Aperçu avant publication
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{entry.title}</h1>
          <p className="text-gray-500 text-sm">
            Par <span className="font-medium text-gray-700 dark:text-gray-300">{entry.author.name}</span>
          </p>
        </div>

        {entry.imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
            <Image
              src={entry.imageUrl}
              alt={entry.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div 
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      </article>
    </main>
  );
}