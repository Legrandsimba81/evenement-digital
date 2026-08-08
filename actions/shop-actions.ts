// actions/shop-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/blog";

export async function createShop(data: {
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  categoryId: string;
  address?: string;
  city?: string;
  province?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  portfolio?: string;
  priceRange?: string;
  availability?: string;
  experience?: string;
  tags?: string[];
  socialLinks?: any;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");
  const userId = session.user.id;
  if (!userId) throw new Error("ID utilisateur manquant");

  const slug = generateSlug(data.name);
  const existing = await prisma.shop.findUnique({ where: { slug } });
  if (existing) {
    throw new Error(
      "Une boutique avec ce nom existe déjà. Si vous êtes le propriétaire de ce nom, contactez-nous sur WhatsApp au +243 992 598 826 ou par email à support@octavia-event.com. pour supprimer le profil de la boutique et libérer le nom."
    );
  };

  const shop = await prisma.shop.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      logo: data.logo,
      coverImage: data.coverImage,
      categoryId: data.categoryId,
      userId,
      address: data.address,
      city: data.city,
      province: data.province,
      phone: data.phone,
      whatsapp: data.whatsapp,
      website: data.website,
      profile: {
        create: {
          portfolio: data.portfolio,
          priceRange: data.priceRange,
          availability: data.availability,
          experience: data.experience,
          tags: data.tags || [],
          socialLinks: data.socialLinks || {},
        },
      },
    },
  });
  revalidatePath("/boutiques");
  revalidatePath("/dashboard/shops");
  return shop;
}

export async function getShop(slug: string) {
  return prisma.shop.findUnique({
    where: { slug },
    include: {
      category: true,
      profile: true,
      user: { select: { name: true, email: true } },
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getShops({
  categoryId,
  city,
  search,
  page = 1,
  limit = 12,
}: {
  categoryId?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const skip = (page - 1) * limit;
  const where: any = { isActive: true };
  if (categoryId) where.categoryId = categoryId;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      include: {
        category: true,
        profile: { select: { priceRange: true } },
        reviews: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.shop.count({ where }),
  ]);

  const shopsWithAvg = shops.map((shop) => ({
    ...shop,
    avgRating: shop.reviews.length ? 0 : 0,
  }));

  return { shops: shopsWithAvg, total, page, limit };
}

export async function getShopCategories() {
  return prisma.shopCategory.findMany({
    orderBy: { name: "asc" },
  });
}

export async function updateShop(slug: string, data: any) {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");
  const userId = session.user.id;
  if (!userId) throw new Error("ID utilisateur manquant");

  const shop = await prisma.shop.findUnique({ where: { slug } });
  if (!shop) throw new Error("Boutique introuvable");
  if (shop.userId !== userId && session.user.role !== "ADMIN")
    throw new Error("Non autorisé");

  const updated = await prisma.shop.update({
    where: { slug },
    data: {
      ...data,
      profile: {
        upsert: {
          update: data.profile || {},
          create: data.profile || {},
        },
      },
    },
  });
  revalidatePath(`/boutiques/${slug}`);
  revalidatePath("/boutiques");
  return updated;
}

export async function deleteShop(slug: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");
  const userId = session.user.id;
  if (!userId) throw new Error("ID utilisateur manquant");

  const shop = await prisma.shop.findUnique({ where: { slug } });
  if (!shop) throw new Error("Boutique introuvable");
  if (shop.userId !== userId && session.user.role !== "ADMIN")
    throw new Error("Non autorisé");

  await prisma.shop.delete({ where: { slug } });
  revalidatePath("/boutiques");
  revalidatePath("/dashboard/shops");
}

export async function createReservation(
  shopSlug: string,
  date: Date,
  message?: string
) {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");
  const userId = session.user.id;
  if (!userId) throw new Error("ID utilisateur manquant");

  const shop = await prisma.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop) throw new Error("Boutique introuvable");

  return prisma.reservation.create({
    data: {
      shopId: shop.id,
      userId,
      date,
      message,
      status: "pending",
    },
  });
}

export async function addReview(shopId: string, rating: number, comment?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");
  const userId = session.user.id;
  if (!userId) throw new Error("ID utilisateur manquant");

  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { slug: true } });
  if (!shop) throw new Error("Boutique introuvable");

  const review = await prisma.review.create({
    data: {
      shopId,
      userId,
      rating,
      comment,
    },
  });
  revalidatePath(`/boutiques/${shop.slug}`);
  return review;
}

// ========== Gestion du portfolio ==========

export async function addPortfolioImages(slug: string, imageUrls: string[]) {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");
  const userId = session.user.id;
  if (!userId) throw new Error("ID utilisateur manquant");

  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: { profile: true },
  });
  if (!shop) throw new Error("Boutique introuvable");
  if (shop.userId !== userId && session.user.role !== "ADMIN")
    throw new Error("Non autorisé");

  const currentImages = (shop.profile?.images as string[]) || [];
  const updatedImages = [...currentImages, ...imageUrls];
  await prisma.shopProfile.upsert({
    where: { shopId: shop.id },
    update: { images: updatedImages },
    create: { shopId: shop.id, images: updatedImages },
  });
  revalidatePath(`/boutiques/${slug}`);
  revalidatePath(`/dashboard/shops/${slug}/portfolio`);
  return updatedImages;
}

export async function removePortfolioImage(slug: string, imageUrl: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");
  const userId = session.user.id;
  if (!userId) throw new Error("ID utilisateur manquant");

  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: { profile: true },
  });
  if (!shop) throw new Error("Boutique introuvable");
  if (shop.userId !== userId && session.user.role !== "ADMIN")
    throw new Error("Non autorisé");

  const currentImages = (shop.profile?.images as string[]) || [];
  const updatedImages = currentImages.filter((url) => url !== imageUrl);
  await prisma.shopProfile.update({
    where: { shopId: shop.id },
    data: { images: updatedImages },
  });
  revalidatePath(`/boutiques/${slug}`);
  revalidatePath(`/dashboard/shops/${slug}/portfolio`);
  return updatedImages;
}