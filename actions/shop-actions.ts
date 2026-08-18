// actions/shop-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// ---------- Types ----------
type ImageItem = { url: string; orientation: 'portrait' | 'paysage' };

// ---------- Schémas de validation ----------
const ShopCreateSchema = z.object({
  name: z.string().min(1, "Nom requis").max(100),
  description: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Catégorie requise"),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  website: z.string().url("URL invalide").optional().nullable().or(z.literal("")),
  coverImage: z.string().url("URL invalide").optional().nullable().or(z.literal("")),
  logo: z.string().url("URL invalide").optional().nullable().or(z.literal("")),
  province: z.string().optional().nullable(),
  profile: z.object({
    portfolio: z.string().optional().nullable(),
    priceRange: z.string().optional().nullable(),
    availability: z.string().optional().nullable(),
    experience: z.string().optional().nullable(),
    tags: z.array(z.string()).default([]),
    images: z.array(z.object({
      url: z.string().url("URL invalide"),
      orientation: z.enum(['portrait', 'paysage']).default('paysage'),
    })).default([]),
  }).optional().nullable(),
});

const ShopUpdateSchema = ShopCreateSchema.partial();

export type ShopFilterParams = {
  categoryId?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
  includeInactive?: boolean;
};

// ---------- Helpers de normalisation ----------
function normalizeStringArray(value: Prisma.JsonValue): string[] {
  console.log("[normalizeStringArray] Input:", value);
  if (Array.isArray(value)) {
    const filtered = value.filter((v): v is string => typeof v === "string");
    console.log("[normalizeStringArray] →", filtered.length, "strings");
    return filtered;
  }
  return [];
}

function normalizeImageArray(value: Prisma.JsonValue): ImageItem[] {
  console.log("[normalizeImageArray] Input:", value);
  if (!Array.isArray(value)) return [];
  const result: ImageItem[] = [];
  for (const item of value) {
    if (typeof item === 'string') {
      result.push({ url: item, orientation: 'paysage' });
    } else if (typeof item === 'object' && item !== null && 'url' in item && typeof item.url === 'string') {
      const orientation = (item as any).orientation === 'portrait' ? 'portrait' : 'paysage';
      result.push({ url: item.url, orientation });
    }
  }
  console.log("[normalizeImageArray] →", result.length, "images");
  return result;
}

function normalizeProfile(profile: any) {
  console.log("[normalizeProfile] Input:", profile);
  if (!profile) {
    console.log("[normalizeProfile] → null");
    return null;
  }
  try {
    const normalized = {
      ...profile,
      images: normalizeImageArray(profile.images),
      tags: normalizeStringArray(profile.tags),
    };
    console.log("[normalizeProfile] → OK");
    return normalized;
  } catch (error) {
    console.error("[normalizeProfile] Error:", error);
    throw error;
  }
}

// ---------- Liste des boutiques ----------
export async function getShops(params: ShopFilterParams = {}) {
  console.log("[getShops] Called with:", params);
  const { categoryId, city, search, page = 1, limit = 12, includeInactive = false } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.ShopWhereInput = {
    ...(!includeInactive && { isActive: true }),
    ...(categoryId && { categoryId }),
    ...(city && { city: { contains: city, mode: "insensitive" } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  try {
    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          reviews: { select: { rating: true } },
          profile: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.shop.count({ where }),
    ]);

    const shopsWithAvg = shops.map((shop) => {
      const ratings = shop.reviews?.map((r) => r.rating) ?? [];
      const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
      const profile = normalizeProfile(shop.profile);
      return { ...shop, profile, avgRating: avg };
    });

    console.log(`[getShops] Returning ${shopsWithAvg.length} shops`);
    return { shops: shopsWithAvg, total };
  } catch (error) {
    console.error("[getShops] Error:", error);
    throw new Error("Impossible de récupérer la liste des boutiques.");
  }
}

// ---------- Détail d'une boutique ----------
export async function getShopBySlug(slug: string) {
  console.log(`[getShopBySlug] Starting for "${slug}"`);
  try {
    const shop = await prisma.shop.findUnique({
      where: { slug },
      include: {
        category: true,
        user: { select: { id: true, name: true, email: true } },
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        profile: true,
        reservations: { where: { status: "accepted" } },
      },
    });

    if (!shop) {
      console.log(`[getShopBySlug] Not found`);
      return null;
    }

    const profile = normalizeProfile(shop.profile);
    const reviews = shop.reviews ?? [];
    const ratings = reviews.map((r) => r.rating);
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

    return { ...shop, profile, reviews, avgRating };
  } catch (error) {
    console.error(`[getShopBySlug] Critical error for "${slug}":`, error);
    throw new Error(`Erreur lors du chargement de la boutique "${slug}": ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ---------- Créer une boutique ----------
export async function createShop(data: z.infer<typeof ShopCreateSchema>) {
  console.log("[createShop] Called with:", data);
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");

  const validated = ShopCreateSchema.parse(data);
  const baseSlug = validated.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  try {
    const shop = await prisma.shop.create({
      data: {
        name: validated.name,
        slug,
        description: validated.description || undefined,
        categoryId: validated.categoryId,
        city: validated.city || undefined,
        address: validated.address || undefined,
        phone: validated.phone || undefined,
        whatsapp: validated.whatsapp || undefined,
        website: validated.website || undefined,
        coverImage: validated.coverImage || undefined,
        logo: validated.logo || undefined,
        province: validated.province || undefined,
        userId: session.user.id,
        isActive: true,
        isVerified: false,
        profile: validated.profile ? {
          create: {
            portfolio: validated.profile.portfolio || undefined,
            priceRange: validated.profile.priceRange || undefined,
            availability: validated.profile.availability || undefined,
            experience: validated.profile.experience || undefined,
            tags: validated.profile.tags ?? [],
            images: validated.profile.images ?? [],
          },
        } : undefined,
      },
      include: { profile: true },
    });

    revalidatePath("/boutiques");
    revalidatePath("/dashboard/shops");
    return { success: true, shop };
  } catch (error) {
    console.error("[createShop] Error:", error);
    throw new Error("Échec de la création de la boutique.");
  }
}

// ---------- Mettre à jour une boutique ----------
export async function updateShop(slug: string, data: z.infer<typeof ShopUpdateSchema>) {
  console.log(`[updateShop] Updating "${slug}"`);
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");

  const validated = ShopUpdateSchema.parse(data);
  const existing = await prisma.shop.findUnique({ where: { slug } });
  if (!existing) throw new Error("Boutique non trouvée.");
  if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Permission insuffisante.");
  }

  const updateData: Prisma.ShopUpdateInput = {
    name: validated.name,
    description: validated.description || undefined,
    city: validated.city || undefined,
    address: validated.address || undefined,
    phone: validated.phone || undefined,
    whatsapp: validated.whatsapp || undefined,
    website: validated.website || undefined,
    coverImage: validated.coverImage || undefined,
    logo: validated.logo || undefined,
    province: validated.province || undefined,
    ...(validated.categoryId && { category: { connect: { id: validated.categoryId } } }),
  };

  if (validated.profile) {
    const existingProfile = await prisma.shopProfile.findUnique({ where: { shopId: existing.id } });
    const profileData = {
      portfolio: validated.profile.portfolio || undefined,
      priceRange: validated.profile.priceRange || undefined,
      availability: validated.profile.availability || undefined,
      experience: validated.profile.experience || undefined,
      tags: validated.profile.tags ?? [],
      images: validated.profile.images ?? [],
    };
    if (existingProfile) {
      updateData.profile = { update: profileData };
    } else {
      updateData.profile = { create: profileData };
    }
  }

  try {
    const updated = await prisma.shop.update({
      where: { slug },
      data: updateData,
      include: { profile: true },
    });
    revalidatePath(`/boutiques/${slug}`);
    revalidatePath("/boutiques");
    revalidatePath("/dashboard/shops");
    return { success: true, shop: updated };
  } catch (error) {
    console.error("[updateShop] Error:", error);
    throw new Error("Échec de la mise à jour.");
  }
}

// ---------- Supprimer ----------
export async function deleteShop(slug: string) {
  console.log(`[deleteShop] Deleting "${slug}"`);
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");
  const existing = await prisma.shop.findUnique({ where: { slug } });
  if (!existing) throw new Error("Boutique non trouvée.");
  if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Permission insuffisante.");
  }
  try {
    await prisma.shop.delete({ where: { slug } });
    revalidatePath("/boutiques");
    revalidatePath("/dashboard/shops");
    return { success: true };
  } catch (error) {
    console.error("[deleteShop] Error:", error);
    throw new Error("Échec de la suppression.");
  }
}

// ---------- Activer / Désactiver ----------
export async function toggleShopActive(slug: string, isActive: boolean) {
  console.log(`[toggleShopActive] ${slug} → ${isActive}`);
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié.");
  const existing = await prisma.shop.findUnique({ where: { slug } });
  if (!existing) throw new Error("Boutique non trouvée.");
  if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Permission insuffisante.");
  }
  try {
    await prisma.shop.update({ where: { slug }, data: { isActive } });
    revalidatePath("/boutiques");
    revalidatePath(`/boutiques/${slug}`);
    return { success: true };
  } catch (error) {
    console.error("[toggleShopActive] Error:", error);
    throw new Error("Échec de la mise à jour du statut.");
  }
}

// ---------- Certifier ----------
export async function certifyShop(slug: string, isVerified: boolean) {
  console.log(`[certifyShop] ${slug} → ${isVerified}`);
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Accès administrateur requis.");
  }
  try {
    await prisma.shop.update({ where: { slug }, data: { isVerified } });
    revalidatePath("/admin/shops");
    revalidatePath(`/boutiques/${slug}`);
    revalidatePath("/boutiques");
    return { success: true };
  } catch (error) {
    console.error("[certifyShop] Error:", error);
    throw new Error("Échec de la certification.");
  }
}

// ---------- Portfolio : ajouter (avec orientation) ----------
export async function addPortfolioImage(
  slug: string,
  imageUrl: string,
  orientation: 'portrait' | 'paysage' = 'paysage'
) {
  console.log(`[addPortfolioImage] ${slug} → ${imageUrl} (${orientation})`);
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");

  const existing = await prisma.shop.findUnique({
    where: { slug },
    include: { profile: true },
  });
  if (!existing) throw new Error("Boutique non trouvée.");
  if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Permission insuffisante.");
  }

  const newImage = { url: imageUrl, orientation };

  if (!existing.profile) {
    await prisma.shopProfile.create({
      data: {
        shopId: existing.id,
        images: [newImage],
        tags: [],
      },
    });
  } else {
    const current = normalizeImageArray(existing.profile.images);
    if (!current.some((img) => img.url === imageUrl)) {
      const updated = [...current, newImage];
      await prisma.shopProfile.update({
        where: { shopId: existing.id },
        data: { images: updated },
      });
    }
  }

  revalidatePath(`/boutiques/${slug}/portfolio`);
  return { success: true };
}

// ---------- Portfolio : supprimer ----------
export async function removePortfolioImage(slug: string, imageUrl: string) {
  console.log(`[removePortfolioImage] ${slug} → ${imageUrl}`);
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");

  const existing = await prisma.shop.findUnique({
    where: { slug },
    include: { profile: true },
  });
  if (!existing || !existing.profile) {
    throw new Error("Boutique ou profil non trouvé.");
  }
  if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Permission insuffisante.");
  }

  const current = normalizeImageArray(existing.profile.images);
  const updated = current.filter((img) => img.url !== imageUrl);

  await prisma.shopProfile.update({
    where: { shopId: existing.id },
    data: { images: updated },
  });

  revalidatePath(`/boutiques/${slug}/portfolio`);
  return { success: true };
}

// ---------- Réservation ----------
export async function createReservation(slug: string, data: { date: string; message?: string }) {
  console.log(`[createReservation] ${slug}`);
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");
  const shop = await prisma.shop.findUnique({ where: { slug } });
  if (!shop) throw new Error("Boutique non trouvée.");
  try {
    const reservation = await prisma.reservation.create({
      data: {
        shopId: shop.id,
        userId: session.user.id,
        date: new Date(data.date),
        message: data.message,
        status: "pending",
      },
    });
    revalidatePath(`/boutiques/${slug}`);
    return { success: true, reservation };
  } catch (error) {
    console.error("[createReservation] Error:", error);
    throw new Error("Échec de la réservation.");
  }
}

// ---------- Avis ----------
export async function addReview(slug: string, data: { rating: number; comment?: string }) {
  console.log(`[addReview] ${slug}`);
  const session = await auth();
  if (!session?.user?.id) throw new Error("Vous devez être connecté.");

  const shop = await prisma.shop.findUnique({ where: { slug } });
  if (!shop) throw new Error("Boutique non trouvée.");

  const existing = await prisma.review.findFirst({
    where: { shopId: shop.id, userId: session.user.id },
  });
  if (existing) throw new Error("Vous avez déjà laissé un avis pour cette boutique.");

  const review = await prisma.review.create({
    data: {
      shopId: shop.id,
      userId: session.user.id,
      rating: data.rating,
      comment: data.comment,
    },
  });
  revalidatePath(`/boutiques/${slug}`);
  return { success: true, review };
}

// ---------- Catégories ----------
export async function getShopCategories() {
  console.log("[getShopCategories] Fetching");
  const categories = await prisma.shopCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, tags: true },
  });
  console.log(`[getShopCategories] Found ${categories.length}`);
  return categories;
}