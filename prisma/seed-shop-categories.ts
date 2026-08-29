import { prisma } from "@/lib/prisma";

const categoriesData = [
  
  // --- NIVEAU 1 : LES INCONTOURNABLES (Le cœur de tout événement) ---

  { name: "Salle", slug: "salle", description: "Location d'espaces événementiels", tags: ["Mariage", "Anniversaire", "Conférence", "Réception", "Extérieur", "Intérieur"] },
  { name: "Traiteur", slug: "traiteur", description: "Restauration événementielle", tags: ["Mariage", "Cocktail", "Réception", "Gala"] },
  { name: "Photographe", slug: "photographe", description: "Capture de souvenirs", tags: ["Mariage", "Événement", "Portrait", "Reportage"] },
  { name: "Vidéaste", slug: "videaste", description: "Enregistrement et post-production vidéo", tags: ["Mariage", "Événement", "Portrait", "Reportage"] },
  { name: "DJ", slug: "dj", description: "Programmation musicale et sonorisation", tags: ["Mariage", "Anniversaire", "Soirée", "Concert", "Musique électronique", "Animation"] },
  { name: "Agence de surprise", slug: "agence-surprise", description: "Création d'expériences de surprise", tags: ["Mariage", "Anniversaire", "Fête"] },

  // --- NIVEAU 2 : AMBIANCE & SCÉNOGRAPHIE (Esthétique et confort) ---

  { name: "Décorateur", slug: "decorateur", description: "Conception d'ambiance visuelle", tags: ["Mariage", "Anniversaire", "Fête", "Thématique"] },
  { name: "Fleuriste", slug: "fleuriste", description: "Art floral et compositions", tags: ["Mariage", "Décoration", "Événement"] },
  { name: "Location de mobilier", slug: "location-mobilier", description: "Location de mobilier événementiel", tags: ["Mariage", "Événement", "Extérieur"] },
  { name: "Resto & Bar", slug: "bar", description: "Service de restauration et de bar", tags: ["Mariage", "Cocktail", "Soirée"] },
  { name: "Hotel", slug: "hotel", description: "Hébergement pour événements", tags: ["Mariage", "Anniversaire", "Fête"] },
  
  // --- NIVEAU 5 : COMMUNICATION & DESIGN (Avant l'événement) ---

  { name: "Graphiste", slug: "graphiste", description: "Création de supports visuels", tags: ["Mariage", "Événement", "Corporate"] },
  { name: "Imprimerie", slug: "imprimerie", description: "Création de supports visuels et imprimés", tags: ["Mariage", "Événement", "Corporate"] },
  { name: "Agence de communication", slug: "agence-communication", description: "Stratégie et promotion d'événements", tags: ["Mariage", "Événement", "Corporate"] },
  { name: "Agence de marketing", slug: "agence-marketing", description: "Promotion et publicité d'événements", tags: ["Mariage", "Événement", "Corporate"] },
  { name: "Agence de relations publiques", slug: "agence-relations-publiques", description: "Gestion de l'image et des relations médias", tags: ["Mariage", "Événement", "Corporate"] },
  
  // --- NIVEAU 3 : ANIMATION DE SCÈNE & MUSIQUE LIVE (Prestations directes) ---

  { name: "Maître de cérémonie", slug: "maitre-de-ceremonie", description: "Animation de soirée", tags: ["Mariage", "Soirée", "Gala", "Corporate"] },
  { name: "Animateur / MC", slug: "animateur", description: "Animation et coordination d'événements", tags: ["Mariage", "Soirée", "Corporate"] },
  { name: "Orchestre", slug: "orchestre", description: "Groupe musical complet", tags: ["Mariage", "Soirée", "Concert", "Cocktail"] },
  { name: "Chanteur", slug: "chanteur", description: "Artiste soliste", tags: ["Mariage", "Concert", "Soirée"] },

  // --- NIVEAU 4 : LOGISTIQUE, TECHNIQUE & SÉCURITÉ (L'infrastructure) ---

  { name: "Location de matériel audiovisuel", slug: "location-audiovisuel", description: "Équipements pour sonorisation et projection", tags: ["Concert", "Conférence", "Gala"] },
  { name: "Transport", slug: "transport", description: "Location de véhicules", tags: ["Mariage", "Événement", "VIP", "Navette"] },
  { name: "Sécurité", slug: "securite", description: "Gardiennage et sécurité", tags: ["Concert", "Événement", "Entreprise"] },
  { name: "Dessinateur", slug: "caricaturiste", description: "Animation artistique en direct pour les invités", tags: ["Mariage", "Corporate", "Cocktail"] },
  { name: "Danseurs", slug: "danseurs", description: "Troupes de danse, cracheurs de feu et acrobates", tags: ["Gala", "Soirée", "Concert", "Thématique"] },
  { name: "Poète", slug: "poete", description: "Lecture de poésie et performance artistique", tags: ["Mariage", "Anniversaire", "Fête"] },
  { name: "Artiste", slug: "artiste", description: "Création d'œuvres artistiques", tags: ["Mariage", "Anniversaire", "Fête"] },
  { name: "Slameur", slug: "slameur", description: "Performance de slam et poésie", tags: ["Mariage", "Anniversaire", "Fête", "spectacle", "soirée"] },
  { name: "Slameuse", slug: "slameuse", description: "Performance de slam et poésie", tags: ["Mariage", "Anniversaire", "Fête", "spectacle", "soirée"] },
  { name: "grimage", slug: "slameur", description: "Performance de slam et poésie", tags: ["Mariage", "Anniversaire", "Fête", "spectacle", "soirée"] },


  // --- NIVEAU 6 : SPECTACLES & ANIMATIONS DE NICHE (Le divertissement bonus) ---

  { name: "Magicien", slug: "magicien", description: "Spectacles de magie et d'illusion", tags: ["Mariage", "Soirée", "Cocktail"] },
  { name: "Comédien", slug: "comedien", description: "Spectacles comiques et théâtraux", tags: ["Mariage", "Soirée", "Cocktail"] },
  { name: "Danseur", slug: "danseur", description: "Performances de danse et chorégraphies", tags: ["Mariage", "Soirée", "Cocktail"] },
  { name: "Acrobate", slug: "acrobate", description: "Spectacles acrobatiques et de cirque", tags: ["Mariage", "Soirée", "Cocktail"] },
  { name: "Artiste de rue", slug: "artiste-de-rue", description: "Performances artistiques en extérieur", tags: ["Mariage", "Soirée", "Cocktail"] },
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