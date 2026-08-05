"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/blog";

export async function createBlogPost(data: {
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  imageOrientation?: "landscape" | "portrait";
  images?: string[];
  tags?: string[];
  published?: boolean;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  const userId = session.user.id;
  if (!userId) throw new Error("ID utilisateur manquant");

  const slug = generateSlug(data.title);
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) throw new Error("Un article avec ce titre existe déjà.");

  const post = await prisma.blogPost.create({
    data: {
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt,
      imageUrl: data.imageUrl,
      imageOrientation: data.imageOrientation || "landscape",
      images: data.images || [],
      tags: data.tags || [],
      published: data.published || false,
      publishedAt: data.published ? new Date() : null,
      authorId: userId,
    },
  });
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  return post;
}

export async function updateBlogPost(slug: string, data: {
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  imageOrientation?: "landscape" | "portrait";
  images?: string[];
  tags?: string[];
  published?: boolean;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (!existing) throw new Error("Article introuvable");

  const newSlug = generateSlug(data.title);
  if (newSlug !== slug) {
    const conflict = await prisma.blogPost.findUnique({ where: { slug: newSlug } });
    if (conflict) throw new Error("Un autre article avec ce titre existe déjà.");
  }

  const post = await prisma.blogPost.update({
    where: { slug },
    data: {
      title: data.title,
      slug: newSlug,
      content: data.content,
      excerpt: data.excerpt,
      imageUrl: data.imageUrl,
      imageOrientation: data.imageOrientation || "landscape",
      images: data.images || [],
      tags: data.tags || [],
      published: data.published || false,
      publishedAt: data.published ? new Date() : null,
    },
  });
  revalidatePath(`/blog/${newSlug}`);
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  return post;
}

export async function deleteBlogPost(slug: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }
  await prisma.blogPost.delete({ where: { slug } });
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
}

export async function getBlogPost(slug: string) {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        imageUrl: true,
        metaTitle: true,
        metaDesc: true,
        tags: true,
        imageOrientation: true,
        images: true,
        published: true,
        publishedAt: true,
        views: true,
        likes: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!post) return null;

    const comments = await prisma.blogComment.findMany({
      where: { postId: post.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        authorName: true,
        createdAt: true,
      },
    });

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    return {
      ...post,
      comments,
    };
  } catch (error) {
    console.error("Erreur getBlogPost:", error);
    return null;
  }
}

export async function getRecentPosts(excludeSlug?: string, limit = 3) {
  try {
    return await prisma.blogPost.findMany({
      where: {
        published: true,
        ...(excludeSlug ? { slug: { not: excludeSlug } } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        imageUrl: true,
        publishedAt: true,
        views: true,
        likes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.error("Erreur getRecentPosts:", error);
    return [];
  }
}

export async function getBlogPosts(page = 1, limit = 9) {
  try {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        include: {
          comments: { select: { id: true } },
        },
      }),
      prisma.blogPost.count({ where: { published: true } }),
    ]);
    return { posts, total, page, limit };
  } catch (error) {
    console.error("Erreur getBlogPosts:", error);
    return { posts: [], total: 0, page, limit };
  }
}

export async function toggleLike(slug: string, sessionId: string) {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) throw new Error("Article introuvable");

  const existingLike = await prisma.blogLike.findFirst({
    where: {
      postId: post.id,
      sessionId,
    },
  });

  if (existingLike) {
    await prisma.blogLike.delete({ where: { id: existingLike.id } });
    const updated = await prisma.blogPost.update({
      where: { id: post.id },
      data: { likes: { decrement: 1 } },
    });
    return { liked: false, likes: updated.likes };
  } else {
    await prisma.blogLike.create({
      data: {
        postId: post.id,
        sessionId,
      },
    });
    const updated = await prisma.blogPost.update({
      where: { id: post.id },
      data: { likes: { increment: 1 } },
    });
    return { liked: true, likes: updated.likes };
  }
}

export async function addComment(slug: string, authorName: string, content: string, authorId?: string) {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) throw new Error("Article introuvable");
  const comment = await prisma.blogComment.create({
    data: {
      postId: post.id,
      authorName,
      content,
      authorId: authorId || null,
    },
  });
  revalidatePath(`/blog/${slug}`);
  return comment;
}

export async function getAllPostsAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }
  return prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      comments: { select: { id: true } },
    },
  });
}