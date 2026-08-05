import { getBlogPost, getRecentPosts, getBlogPost as fetchPost } from "@/actions/blog-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, User, Eye } from "lucide-react";
import LikeButton from "@/components/blog/LikeButton";
import CommentSection from "@/components/blog/CommentSection";
import ShareModal from "@/components/blog/ShareModal";
import { cookies } from "next/headers";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug);
  if (!post) return { title: "Article introuvable" };
  return {
    title: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post) return notFound();

  const recentPosts = await getRecentPosts(params.slug, 3);
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value || "anonymous";

  const imageContainerClass = post.imageOrientation === "portrait" ? "aspect-[3/4]" : "aspect-[16/9]";

  // Récupérer les images secondaires
  const secondaryImages = post.images as string[] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 md:py-16 md:px-8">
      <article className="max-w-4xl mx-auto">
        {post.imageUrl && (
          <div className={`${imageContainerClass} rounded-2xl overflow-hidden mb-8 shadow-lg`}>
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
          <span className="flex items-center gap-1"><User size={16} /> {post.author?.name || "Admin"}</span>
          <span className="flex items-center gap-1"><Calendar size={16} /> {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fr-FR') : "Date inconnue"}</span>
          <span className="flex items-center gap-1"><Eye size={16} /> {post.views} vues</span>
        </div>
        <div className="mt-6 prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300">#{tag}</span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
          <LikeButton postSlug={post.slug} initialLikes={post.likes} sessionId={sessionId} />
          <ShareModal postSlug={post.slug} title={post.title} />
        </div>

        <CommentSection postSlug={post.slug} comments={post.comments} />

        {secondaryImages.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Galerie d'images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {secondaryImages.map((imgUrl: string, idx: number) => (
                <div key={idx} className="rounded-xl overflow-hidden shadow-md">
                  <img src={imgUrl} alt={`Image ${idx + 1}`} className="w-full h-48 object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {recentPosts.length > 0 && (
          <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Articles récents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPosts.map((recent) => (
                <Link key={recent.id} href={`/blog/${recent.slug}`} className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition p-4">
                  {recent.imageUrl && <img src={recent.imageUrl} alt={recent.title} className="w-full h-32 object-cover rounded-lg mb-3" />}
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{recent.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}