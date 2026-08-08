import { prisma } from "@/lib/prisma";

const categoriesData = [
  { name: "Salle", slug: "salle", description: "Location d'espaces événementiels", tags: ["Mariage", "Anniversaire", "Conférence", "Réception", "Extérieur", "Intérieur"] },
  { name: "DJ", slug: "dj", description: "Programmation musicale et sonorisation", tags: ["Mariage", "Anniversaire", "Soirée", "Concert", "Musique électronique", "Animation"] },
  { name: "Maître de cérémonie", slug: "maitre-de-ceremonie", description: "Animation de soirée", tags: ["Mariage", "Soirée", "Gala", "Corporate"] },
  { name: "Décorateur", slug: "decorateur", description: "Conception d'ambiance visuelle", tags: ["Mariage", "Anniversaire", "Fête", "Thématique"] },
  { name: "Photographe / Vidéaste", slug: "photographe", description: "Capture de souvenirs", tags: ["Mariage", "Événement", "Portrait", "Reportage"] },
  { name: "Orchestre", slug: "orchestre", description: "Groupe musical complet", tags: ["Mariage", "Soirée", "Concert", "Cocktail"] },
  { name: "Chanteur", slug: "chanteur", description: "Artiste soliste", tags: ["Mariage", "Concert", "Soirée"] },
  { name: "Fleuriste", slug: "fleuriste", description: "Art floral et compositions", tags: ["Mariage", "Décoration", "Événement"] },
  { name: "Transport", slug: "transport", description: "Location de véhicules", tags: ["Mariage", "Événement", "VIP", "Navette"] },
  { name: "Sécurité", slug: "securite", description: "Gardiennage et sécurité", tags: ["Concert", "Événement", "Entreprise"] },
  { name: "Traiteur", slug: "traiteur", description: "Restauration événementielle", tags: ["Mariage", "Cocktail", "Réception", "Gala"] },
  { name: "Location de chaises et chapiteaux", slug: "location-mobilier", description: "Location de mobilier événementiel", tags: ["Mariage", "Événement", "Extérieur"] },
];

async function main() {
  for (const cat of categoriesData) {
    await prisma.shopCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log("✅ Catégories créées/mises à jour");
}
main()
  .catch(console.error)
  .finally(async () => { await prisma.$disconnect(); });