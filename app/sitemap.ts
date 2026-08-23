import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  // 🚀 Correction de l'URL par défaut avec votre nouveau domaine .com
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://octaviaevent.com";

  // Pages statiques basées sur la structure de votre site Octavia Event
  const staticPages = [
    { url: `${baseUrl}/`, lastModified: new Date(), priority: 1.0, changeFrequency: "daily" as const },
    { url: `${baseUrl}/creer`, lastModified: new Date(), priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/tarifs`, lastModified: new Date(), priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/prestataires`, lastModified: new Date(), priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/blog`, lastModified: new Date(), priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/cgu`, lastModified: new Date(), priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${baseUrl}/mentions-legales`, lastModified: new Date(), priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${baseUrl}/politique-confidentialite`, lastModified: new Date(), priority: 0.3, changeFrequency: "yearly" as const },
  ];

  // Articles de blog publiés
  let postPages: any[] = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    postPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || new Date(),
      priority: 0.7,
      changeFrequency: "weekly" as const,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des articles pour le sitemap:", error);
  }

  // Événements publics ou Prestataires actifs (Remplacement des anciennes "boutiques" si nécessaire)
  let providerPages: any[] = [];
  try {
    const providers = await prisma.shop.findMany({ // Gardez prisma.shop ou adaptez selon votre modèle Prisma final (ex: provider)
      where: { isActive: true },
      select: { slug: true, updatedAt: true, createdAt: true },
      orderBy: { updatedAt: "desc" },
    });

    providerPages = providers.map((provider) => ({
      url: `${baseUrl}/prestataires/${provider.slug}`, // Adapté pour correspondre à votre onglet "Prestataires"
      lastModified: provider.updatedAt || provider.createdAt || new Date(),
      priority: 0.7,
      changeFrequency: "weekly" as const,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des prestataires pour le sitemap:", error);
  }

  return [...staticPages, ...postPages, ...providerPages];
}
