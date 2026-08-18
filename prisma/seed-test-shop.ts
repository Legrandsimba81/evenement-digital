// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Trouver ou créer un utilisateur test
  let user = await prisma.user.findUnique({
    where: { email: 'test@octavia-event.com' },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test@octavia-event.com',
        name: 'Utilisateur Test',
        password: 'hashed_password_placeholder', // si tu utilises credentials, sinon tu peux laisser vide
        role: 'USER',
        canCreateEvents: true,
        isSuperAdmin: false,
      },
    });
    console.log('Utilisateur test créé:', user.id);
  } else {
    console.log('Utilisateur test existant:', user.id);
  }

  // 2. Récupérer une catégorie existante (la première par exemple)
  const category = await prisma.shopCategory.findFirst();
  if (!category) {
    console.error('Aucune catégorie trouvée. Veuillez en créer une d’abord.');
    return;
  }

  // 3. Créer une boutique avec un profil complet
  const shopSlug = 'boutique-test';
  const existingShop = await prisma.shop.findUnique({
    where: { slug: shopSlug },
  });

  if (existingShop) {
    console.log('La boutique test existe déjà, on la supprime pour la recréer proprement.');
    await prisma.shop.delete({ where: { slug: shopSlug } });
  }

  const shop = await prisma.shop.create({
    data: {
      name: 'Boutique Test',
      slug: shopSlug,
      description: 'Ceci est une boutique de test pour valider le fonctionnement.',
      categoryId: category.id,
      userId: user.id,
      isActive: true,
      isVerified: true,
      city: 'Kinshasa',
      address: '123, Avenue de la Révolution',
      phone: '0827733286',
      whatsapp: '0827733286',
      website: 'https://exemple.com',
      coverImage: 'https://placehold.co/1200x400',
      logo: 'https://placehold.co/200x200',
      profile: {
        create: {
          portfolio: 'https://portfolio-test.com',
          priceRange: '100-500$',
          availability: 'Toujours ouvert',
          experience: '5 ans d’expérience',
          tags: ['Mariage', 'Anniversaire', 'Concert'],
          images: [
            'https://placehold.co/600x400/1',
            'https://placehold.co/600x400/2',
            'https://placehold.co/600x400/3',
          ],
        },
      },
    },
    include: { profile: true },
  });

  console.log('Boutique test créée:', shop.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });