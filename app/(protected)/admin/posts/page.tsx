import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAllPostsAdmin } from "@/actions/blog-actions";
import { Trash2, Edit, Eye, Plus, Calendar } from "lucide-react";
import DeletePostButton from "@/components/admin/DeletePostButton";

export default async function AdminPostsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const posts = await getAllPostsAdmin();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Articles du blog</h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={18} /> Nouvel article
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-12">Aucun article pour le moment.</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Titre</th>
                <th className="text-left py-3 px-4 font-semibold">Statut</th>
                <th className="text-left py-3 px-4 font-semibold">Vues</th>
                <th className="text-left py-3 px-4 font-semibold">Commentaires</th>
                <th className="text-left py-3 px-4 font-semibold">Date</th>
                <th className="text-center py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900 dark:text-white">{post.title}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.published ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"}`}>
                      {post.published ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="py-3 px-4">{post.views}</td>
                  <td className="py-3 px-4">{post.comments.length}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fr-FR') : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/blog/${post.slug}`} target="_blank" className="text-blue-500 hover:text-blue-700">
                        <Eye size={16} />
                      </Link>
                      <Link href={`/admin/posts/edit/${post.slug}`} className="text-yellow-500 hover:text-yellow-700">
                        <Edit size={16} />
                      </Link>
                      <DeletePostButton slug={post.slug} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}