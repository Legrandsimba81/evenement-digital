// app/(public)/blog/[slug]/page.tsx
import { getBlogPost, getRecentPosts, getBlogPost as fetchPost } from "@/actions/blog-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Eye } from "lucide-react";
import LikeButton from "@/components/blog/LikeButton";
import CommentSection from "@/components/blog/CommentSection";
import ShareModal from "@/components/blog/ShareModal";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await fetchPost(slug);
    if (!post) return { title: "Article introuvable" };
    return {
      title: post.title || "Sans titre",
      description: post.excerpt || post.content?.substring(0, 160) || "",
      openGraph: {
        title: post.title || "Sans titre",
        description: post.excerpt || post.content?.substring(0, 160) || "",
        images: post.imageUrl ? [{ url: post.imageUrl }] : [],
      },
    };
  } catch {
    return { title: "Article introuvable" };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await getBlogPost(slug);
    if (!post) return notFound();

    const recentPosts = await getRecentPosts(slug, 3);
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value || "anonymous";

    // Sécurisation des données
    const orientation = post.imageOrientation === "portrait" ? "portrait" : "landscape";
    const imageContainerClass = orientation === "portrait" ? "aspect-[3/4]" : "aspect-[16/9]";

    const secondaryImages = Array.isArray(post.images) 
      ? post.images.filter((img): img is string => typeof img === "string")
      : [];

    const publishedDate = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fr-FR') : "Date inconnue";
    const views = post.views || 0;
    const content = post.content || "";
    const tags = Array.isArray(post.tags) ? post.tags : [];
    const comments = Array.isArray(post.comments) ? post.comments : [];
    const description = post.excerpt || post.content?.replace(/<[^>]*>/g, "").slice(0, 160) || "";

    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-10 px-4 md:py-16 md:px-6">
        <article className="max-w-5xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-900/75 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/70 dark:border-gray-800 p-4 sm:p-6 md:p-8">
            {post.imageUrl && (
              <a
                href={post.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className={`${imageContainerClass} block rounded-2xl overflow-hidden mb-8 shadow-lg ring-1 ring-black/5 hover:scale-[1.01] transition-transform`}
                aria-label="Ouvrir et télécharger l'image principale"
              >
                <img src={post.imageUrl} alt={post.title || "Article"} className="w-full h-full object-cover" />
              </a>
            )}

            <header className="mb-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">{post.title || "Sans titre"}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
                <span className="flex items-center gap-1"><Calendar size={16} /> {publishedDate}</span>
                <span className="flex items-center gap-1"><Eye size={16} /> {views} vues</span>
              </div>
              {description && (
                <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-300">{description}</p>
              )}
            </header>

            <div className="mt-6 prose prose-lg prose-img:rounded-2xl dark:prose-invert max-w-none prose-headings:scroll-mt-24" dangerouslySetInnerHTML={{ __html: content }} />

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300">#{tag}</span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <LikeButton postSlug={slug} initialLikes={post.likes || 0} likedByCurrentUser={post.likedByCurrentUser || false} />
              <ShareModal postSlug={slug} title={post.title || "Article"} />
            </div>

            <CommentSection postSlug={slug} comments={comments} />

            {secondaryImages.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Galerie d'images</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {secondaryImages.map((imgUrl, idx) => (
                    <a
                      key={idx}
                      href={imgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5 hover:scale-[1.02] transition-transform"
                      aria-label={`Télécharger l'image ${idx + 1}`}
                    >
                      <img src={imgUrl} alt={`Image ${idx + 1}`} className="w-full h-48 object-cover" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {recentPosts.length > 0 && (
              <section className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Articles récents</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recentPosts.map((recent) => (
                    <Link key={recent.id} href={`/blog/${recent.slug}`} className="bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-lg transition p-4 border border-gray-200 dark:border-gray-800">
                      {recent.imageUrl && <img src={recent.imageUrl} alt={recent.title} className="w-full h-32 object-cover rounded-lg mb-3" />}
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{recent.title}</h3>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </div>
    );
  } catch (error) {
    console.error("Erreur sur la page article:", error);
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Une erreur est survenue</h1>
          <p className="text-gray-600 dark:text-gray-400">Impossible de charger cet article. Veuillez réessayer plus tard.</p>
        </div>
      </div>
    );
  }
}