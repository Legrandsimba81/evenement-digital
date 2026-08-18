// actions/shop-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// ---------- Schémas de validation avec Zod ----------
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
  province: z.string().optional().nullable(), // ajouté
  profile: z.object({
    portfolio: z.string().optional().nullable(),
    priceRange: z.string().optional().nullable(),
    availability: z.string().optional().nullable(),
    experience: z.string().optional().nullable(),
    tags: z.array(z.string()).default([]),
    images: z.array(z.string().url("URL invalide")).default([]),
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

// ---------- Helpers pour normaliser les champs JSON ----------
function normalizeStringArray(value: Prisma.JsonValue): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function normalizeProfile(profile: any) {
  if (!profile) return null;
  return {
    ...profile,
    images: normalizeStringArray(profile.images),
    tags: normalizeStringArray(profile.tags),
  };
}

// ---------- Liste des boutiques (paginée, filtrée) ----------
export async function getShops(params: ShopFilterParams = {}) {
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

    return { shops: shopsWithAvg, total };
  } catch (error) {
    console.error("getShops error:", error);
    throw new Error("Impossible de récupérer la liste des boutiques.");
  }
}

// ---------- Détail d'une boutique ----------
export async function getShopBySlug(slug: string) {
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
    if (!shop) return null;

    const reviews = shop.reviews ?? [];
    const ratings = reviews.map((r) => r.rating);
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    const profile = normalizeProfile(shop.profile);

    return { ...shop, profile, reviews, avgRating };
  } catch (error) {
    console.error("getShopBySlug error:", error);
    throw new Error("Erreur lors du chargement de la boutique.");
  }
}

// ---------- Créer une boutique ----------
export async function createShop(data: z.infer<typeof ShopCreateSchema>) {
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
    console.error("createShop error:", error);
    throw new Error("Échec de la création de la boutique.");
  }
}

// ---------- Mettre à jour une boutique ----------
export async function updateShop(slug: string, data: z.infer<typeof ShopUpdateSchema>) {
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
    console.error("updateShop error:", error);
    throw new Error("Échec de la mise à jour.");
  }
}

// ---------- Supprimer ----------
export async function deleteShop(slug: string) {
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
    console.error("deleteShop error:", error);
    throw new Error("Échec de la suppression.");
  }
}

// ---------- Activer / Désactiver ----------
export async function toggleShopActive(slug: string, isActive: boolean) {
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
    console.error("toggleShopActive error:", error);
    throw new Error("Échec de la mise à jour du statut.");
  }
}

// ---------- Certifier (admin) ----------
export async function certifyShop(slug: string, isVerified: boolean) {
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
    console.error("certifyShop error:", error);
    throw new Error("Échec de la certification.");
  }
}

// ---------- Portfolio : ajouter / supprimer une image ----------
export async function addPortfolioImage(slug: string, imageUrl: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");
  const existing = await prisma.shop.findUnique({ where: { slug }, include: { profile: true } });
  if (!existing) throw new Error("Boutique non trouvée.");
  if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Permission insuffisante.");
  }

  if (!existing.profile) {
    await prisma.shopProfile.create({
      data: { shopId: existing.id, images: [imageUrl], tags: [] },
    });
  } else {
    const current = normalizeStringArray(existing.profile.images);
    if (!current.includes(imageUrl)) {
      await prisma.shopProfile.update({
        where: { shopId: existing.id },
        data: { images: [...current, imageUrl] },
      });
    }
  }
  revalidatePath(`/boutiques/${slug}/portfolio`);
  return { success: true };
}

export async function removePortfolioImage(slug: string, imageUrl: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié.");
  const existing = await prisma.shop.findUnique({ where: { slug }, include: { profile: true } });
  if (!existing || !existing.profile) throw new Error("Boutique ou profil non trouvé.");
  if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Permission insuffisante.");
  }
  const current = normalizeStringArray(existing.profile.images);
  const updated = current.filter((url) => url !== imageUrl);
  await prisma.shopProfile.update({
    where: { shopId: existing.id },
    data: { images: updated },
  });
  revalidatePath(`/boutiques/${slug}/portfolio`);
  return { success: true };
}

// ---------- Réservation ----------
export async function createReservation(slug: string, data: { date: string; message?: string }) {
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
    console.error("createReservation error:", error);
    throw new Error("Échec de la réservation.");
  }
}

// ---------- Catégories ----------
export async function getShopCategories() {
  return prisma.shopCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, tags: true },
  });
}