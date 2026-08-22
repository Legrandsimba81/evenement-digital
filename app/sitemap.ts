// app/sitemap.ts
import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://evenement-digital.vercel.app";

  // Pages statiques
  const staticPages = [
    { url: `${baseUrl}/`, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/boutiques`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/tarifs`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/cgu`, lastModified: new Date(), priority: 0.5 },
    { url: `${baseUrl}/mentions-legales`, lastModified: new Date(), priority: 0.5 },
    { url: `${baseUrl}/politique-confidentialite`, lastModified: new Date(), priority: 0.5 },
  ];

  // Articles de blog publiés
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const postPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt || new Date(),
    priority: 0.8,
    changeFrequency: "weekly" as const,
  }));

  // Boutiques actives
  const shops = await prisma.shop.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true, createdAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const shopPages = shops.map((shop) => ({
    url: `${baseUrl}/boutiques/${shop.slug}`,
    lastModified: shop.updatedAt || shop.createdAt || new Date(),
    priority: 0.7,
    changeFrequency: "monthly" as const,
  }));

  return [...staticPages, ...postPages, ...shopPages];
}