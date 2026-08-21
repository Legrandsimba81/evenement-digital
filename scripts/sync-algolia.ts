// scripts/sync-algolia.ts
import { prisma } from "../lib/prisma"; // Ajustez le chemin selon votre structure si nécessaire
import { algoliaClient, configureAlgoliaIndex } from "../lib/algolia";

async function syncShopsToAlgolia() {
  console.log("Début de la synchronisation Algolia...");

  try {
    const shops = await prisma.shop.findMany({
      include: {
        category: true,
        profile: true,
        reviews: true,
        user: { select: { id: true, name: true, email: true } },
      },
      where: { isActive: true },
    });

    console.log(`${shops.length} boutiques à indexer`);

    if (shops.length === 0) {
      console.log("Aucune boutique active trouvée dans la base de données.");
      return;
    }

    // Transformer les données pour Algolia
    const objects = shops.map((shop) => ({
      objectID: shop.id,
      name: shop.name,
      slug: shop.slug,
      description: shop.description || "",
      city: shop.city || "",
      province: shop.province || "",
      address: shop.address || "",
      phone: shop.phone || "",
      whatsapp: shop.whatsapp || "",
      website: shop.website || "",
      coverImage: shop.coverImage || "",
      logo: shop.logo || "",
      isVerified: shop.isVerified,
      isActive: shop.isActive,
      priceRange: shop.profile?.priceRange || "Prix sur demande",
      tags: shop.profile?.tags || [],
      category: shop.category
        ? { id: shop.category.id, name: shop.category.name }
        : null,
      user: shop.user
        ? { id: shop.user.id, name: shop.user.name }
        : null,
      averageRating: shop.reviews.length
        ? shop.reviews.reduce((acc, r) => acc + r.rating, 0) / shop.reviews.length
        : 0,
      reviewCount: shop.reviews.length,
      createdAt: shop.createdAt.getTime(),
    }));

    // Indexation par lots (Nouvelle syntaxe v5)
    await algoliaClient.saveObjects({
      indexName: process.env.ALGOLIA_INDEX_NAME!,
      objects: objects,
    });

    // Configuration des paramètres de pertinence et des filtres de l'index
    await configureAlgoliaIndex();

    console.log("Synchronisation Algolia terminée avec succès !");
  } catch (error) {
    console.error("Erreur de synchronisation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution
syncShopsToAlgolia();
