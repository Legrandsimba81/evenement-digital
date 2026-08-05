import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BlogPage({ searchParams }: { searchParams?: { page?: string } }) {
  const page = Number.parseInt(searchParams?.page || "1", 10) || 1;
  const limit = 9;
  const skip = (page - 1) * limit;

  let posts: Awaited<ReturnType<typeof prisma.blogPost.findMany>> = [];
  let total = 0;

  try {
    const queryResult = await Promise.all([
      prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        include: { comments: { select: { id: true } } },
      }),
      prisma.blogPost.count({ where: { published: true } }),
    ]);

    posts = queryResult[0];
    total = queryResult[1];
  } catch (error) {
    console.error("Erreur chargement blog:", error);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 md:py-16 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">Blog Octavia Event</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Astuces, actualités et inspirations pour vos événements</p>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-gray-500">Aucun article pour l'instant.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all">
                  {post.imageUrl && (
                    <div className="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition">{post.title}</h2>
                    {post.excerpt && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{post.excerpt}</p>}
                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fr-FR') : 'Date inconnue'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <Link
                      key={p}
                      href={`/blog?page=${p}`}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                        p === page
                          ? "bg-primary-500 text-white"
                          : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}