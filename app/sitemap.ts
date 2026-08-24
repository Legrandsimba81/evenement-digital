import { db } from "@/lib/db";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://octaviaevent.com";

  // 1. Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), priority: 1.0, changeFrequency: "daily" },
    { url: `${baseUrl}/concours`, lastModified: new Date(), priority: 0.9, changeFrequency: "daily" },
    { url: `${baseUrl}/boutiques`, lastModified: new Date(), priority: 0.8, changeFrequency: "weekly" },
    { url: `${baseUrl}/blog`, lastModified: new Date(), priority: 0.8, changeFrequency: "weekly" },
    { url: `${baseUrl}/tarifs`, lastModified: new Date(), priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/guide-utilisation`, lastModified: new Date(), priority: 0.6, changeFrequency: "monthly" },
    { url: `${baseUrl}/guide-dashboard`, lastModified: new Date(), priority: 0.6, changeFrequency: "monthly" },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.5, changeFrequency: "monthly" },
    { url: `${baseUrl}/cgu`, lastModified: new Date(), priority: 0.3, changeFrequency: "yearly" },
    { url: `${baseUrl}/mentions-legales`, lastModified: new Date(), priority: 0.3, changeFrequency: "yearly" },
    { url: `${baseUrl}/politique-confidentialite`, lastModified: new Date(), priority: 0.3, changeFrequency: "yearly" },
  ];

  // 2. Articles de concours approuvés (Champs ajustés sans updatedAt)
  let competitionPages: MetadataRoute.Sitemap = [];
  try {
    const competitions = await db.competitionEntry.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, publishedAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    competitionPages = competitions.map((entry) => ({
      url: `${baseUrl}/concours/${entry.slug}`,
      lastModified: entry.publishedAt || entry.createdAt || new Date(),
      priority: 0.8,
      changeFrequency: "daily",
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des concours pour le sitemap:", error);
  }

  // 3. Articles de blog publiés
  let postPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await db.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, publishedAt: true, createdAt: true },
      orderBy: { updatedAt: "desc" },
    });

    postPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || post.createdAt || new Date(),
      priority: 0.7,
      changeFrequency: "weekly",
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des articles pour le sitemap:", error);
  }

  // 4. Boutiques / Prestataires actifs
  let shopPages: MetadataRoute.Sitemap = [];
  try {
    const shops = await db.shop.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true, createdAt: true },
      orderBy: { updatedAt: "desc" },
    });

    shopPages = shops.map((shop) => ({
      url: `${baseUrl}/boutiques/${shop.slug}`,
      lastModified: shop.updatedAt || shop.createdAt || new Date(),
      priority: 0.7,
      changeFrequency: "weekly",
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des boutiques pour le sitemap:", error);
  }

  return [...staticPages, ...competitionPages, ...postPages, ...shopPages];
}