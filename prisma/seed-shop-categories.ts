import { prisma } from "@/lib/prisma";

const categoriesData = [
  // --- NIVEAU 1 : LES INCONTOURNABLES (Le cœur de tout événement) ---
  {
    name: "Salle & Lieu de réception",
    slug: "salle",
    description: "Location d'espaces et salles pour réceptions et événements",
    tags: ["Mariage", "Anniversaire", "Conférence", "Réception", "Extérieur", "Intérieur"]
  },
  {
    name: "Traiteur & Restauration",
    slug: "traiteur",
    description: "Services de restauration, buffets et repas événementiels",
    tags: ["Mariage", "Cocktail", "Réception", "Gala", "Buffet"]
  },
  {
    name: "Photographe",
    slug: "photographe",
    description: "Capture de souvenirs, séances photos et reportages",
    tags: ["Mariage", "Événement", "Portrait", "Reportage", "Studio"]
  },
  {
    name: "Vidéaste",
    slug: "videaste",
    description: "Tournage, réalisation et post-production vidéo",
    tags: ["Mariage", "Événement", "Film", "Reportage", "Drone"]
  },
  {
    name: "DJ / Disc-Jockey",
    slug: "dj",
    description: "Programmation musicale, sonorisation et animation de soirée",
    tags: ["Mariage", "Anniversaire", "Soirée", "Concert", "Animation"]
  },
  {
    name: "Wedding Planner / Organisateur",
    slug: "wedding-planner",
    description: "Organisation globale, coordination et planification d'événements",
    tags: ["Mariage", "Anniversaire", "Organisation", "Coordination"]
  },
  {
    name: "Agence événementielle",
    slug: "agence-evenementielle",
    description: "Conception, gestion et organisation clé en main d'événements",
    tags: ["Corporate", "Gala", "Mariage", "Lancement de produit"]
  },
  {
    name: "Agence de surprise",
    slug: "agence-surprise",
    description: "Création d'expériences sur mesure, demandes en mariage et surprises",
    tags: ["Mariage", "Anniversaire", "Surprise", "Romantique"]
  },
  {
    name: "Influenceur",
    slug: "influenceur",
    description: "Promotion, couverture médiatique et présence de personnalités web",
    tags: ["Marketing", "Lancement", "Promotion", "Réseaux Sociaux"]
  },

  // --- NIVEAU 2 : BEAUTÉ, STYLE & HABILLEMENT ---
  {
    name: "Coiffure & Maquillage (MUA)",
    slug: "coiffure-maquillage",
    description: "Mise en beauté, coiffure événementielle et maquillage professionnel",
    tags: ["Mariage", "Beauté", "MUA", "Gala", "Coiffure"]
  },
  {
    name: "Robe de mariée & Costumes",
    slug: "habilleur-costume",
    description: "Location et vente de tenues de cérémonie, robes et costumes",
    tags: ["Mariage", "Tenue de fête", "Sur-mesure", "Gala"]
  },

  // --- NIVEAU 3 : AMBIANCE & SCÉNOGRAPHIE ---
  {
    name: "Décorateur / Scénographe",
    slug: "decorateur",
    description: "Conception d'ambiance visuelle, thématisation et scénographie",
    tags: ["Mariage", "Anniversaire", "Fête", "Thématique", "Design"]
  },
  {
    name: "Fleuriste & Art Floral",
    slug: "fleuriste",
    description: "Compositions florales, bouquets de mariée et centres de table",
    tags: ["Mariage", "Décoration", "Fleurs", "Événement"]
  },
  {
    name: "Location de mobilier & Vaisselle",
    slug: "location-mobilier",
    description: "Location de tables, chaises, vaisselle et éléments de décoration",
    tags: ["Mariage", "Événement", "Extérieur", "Logistique"]
  },
  {
    name: "Resto & Bar mobile",
    slug: "bar",
    description: "Services de barman, mixologie et comptoirs de boisson",
    tags: ["Mariage", "Cocktail", "Soirée", "Barman"]
  },
  {
    name: "Hôtel & Hébergement",
    slug: "hotel",
    description: "Hébergement et logement des invités ou des organisateurs",
    tags: ["Mariage", "Hébergement", "Séjour", "VIP"]
  },

  // --- NIVEAU 4 : ANIMATION DE SCÈNE & MUSIQUE LIVE ---
  {
    name: "Maître de cérémonie",
    slug: "maitre-de-ceremonie",
    description: "Présentation officielle et animation du protocole",
    tags: ["Mariage", "Soirée", "Gala", "Corporate", "Protocole"]
  },
  {
    name: "Animateur / Animatrice (MC)",
    slug: "animateur",
    description: "Dynamisation, jeux et coordination en direct sur scène",
    tags: ["Mariage", "Soirée", "Corporate", "Jeux"]
  },
  {
    name: "Orchestre & Groupe de musique",
    slug: "orchestre",
    description: "Groupe musical live pour vin d'honneur ou soirée",
    tags: ["Mariage", "Soirée", "Concert", "Cocktail", "Live"]
  },
  {
    name: "Chanteur / Chanteuse",
    slug: "chanteur",
    description: "Prestation vocale solo ou accompagnement musical",
    tags: ["Mariage", "Concert", "Soirée", "Recueillement"]
  },
  {
    name: "Slameur / Slameuse",
    slug: "slameur",
    description: "Performance poétique, textes personnalisés et slam",
    tags: ["Mariage", "Anniversaire", "Spectacle", "Poésie"]
  },
  {
    name: "Poète / Poétesse",
    slug: "poete",
    description: "Ecriture et récital de poèmes sur mesure pour cérémonies",
    tags: ["Mariage", "Anniversaire", "Culture", "Cérémonie"]
  },

  // --- NIVEAU 5 : SPECTACLES, ARTS & DIVERTISSEMENTS ---
  {
    name: "Photobooth / Borne Photo",
    slug: "photobooth",
    description: "Location de bornes photo instantanées et livre d'or vidéo",
    tags: ["Mariage", "Anniversaire", "Souvenir", "Animation"]
  },
  {
    name: "Magicien / Magicienne",
    slug: "magicien",
    description: "Spectacles d'illusion, mentalisme et close-up",
    tags: ["Mariage", "Soirée", "Cocktail", "Close-up"]
  },
  {
    name: "Comédien / Comédienne",
    slug: "comedien",
    description: "Interventions comiques, théâtre d'improvisation et caméra cachée",
    tags: ["Mariage", "Soirée", "Humour", "Spectacle"]
  },
  {
    name: "Danseur / Danseuse & Troupes",
    slug: "danseur",
    description: "Performances de danse, spectacles chorégraphiés et animations",
    tags: ["Gala", "Soirée", "Concert", "Chorégraphie"]
  },
  {
    name: "Acrobate & Arts du cirque",
    slug: "acrobate",
    description: "Performances acrobatiques, échassiers et cracheurs de feu",
    tags: ["Spectacle", "Soirée", "Cirque", "Extérieur"]
  },
  {
    name: "Artiste peintre / Caricaturiste",
    slug: "caricaturiste",
    description: "Animation artistique, portrait en direct et peinture live",
    tags: ["Mariage", "Corporate", "Cocktail", "Souvenir"]
  },
  {
    name: "Grimage & Maquillage",
    slug: "grimage",
    description: "Maquillage artistique pour enfants et animations festives",
    tags: ["Anniversaire", "Enfants", "Fête", "Animation"]
  },
  {
    name: "Feux d'artifice",
    slug: "pyrotechnie",
    description: "Feux d'artifice, étincelles froides et effets spéciaux",
    tags: ["Mariage", "Spectacle", "Effets Spéciaux", "Extérieur"]
  },
  {
    name: "Structures gonflables",
    slug: "animations-enfants",
    description: "Location de châteaux gonflables et jeux pour enfants",
    tags: ["Anniversaire", "Enfants", "Famille", "Plein air"]
  },

  // --- NIVEAU 6 : COMMUNICATION & DESIGN ---
  {
    name: "Graphiste & Designer",
    slug: "graphiste",
    description: "Création de faire-part, invitations et chartes visuelles",
    tags: ["Mariage", "Événement", "Design", "Faire-part"]
  },
  {
    name: "Imprimerie",
    slug: "imprimerie",
    description: "Impression grand format, billetterie, bannières et faire-part",
    tags: ["Impression", "Corporate", "Faire-part", "Signalétique"]
  },
  {
    name: "Agence de communication",
    slug: "agence-communication",
    description: "Stratégie globale et diffusion média pour événements",
    tags: ["Communication", "Corporate", "Publicité"]
  },
  {
    name: "Agence de marketing",
    slug: "agence-marketing",
    description: "Campagnes sponsorisées et promotion en ligne",
    tags: ["Marketing", "Digital", "Publicité", "Web"]
  },
  {
    name: "Relations Publiques & Presse",
    slug: "agence-relations-publiques",
    description: "Gestion des médias, accréditations et couverture de presse",
    tags: ["Presse", "Corporate", "Gala", "VIP"]
  },

  // --- NIVEAU 7 : LOGISTIQUE, SÉCURITÉ & TECHNIQUE ---
  {
    name: "Sonorisation, Éclairage",
    slug: "location-audiovisuel",
    description: "Location d'équipements son, lumière, écrans LED et projecteurs",
    tags: ["Concert", "Conférence", "Gala", "Technique"]
  },
  {
    name: "Transport & Location de véhicules",
    slug: "transport",
    description: "Location de voitures de luxe, limousines et navettes d'invités",
    tags: ["Mariage", "VIP", "Navette", "Transport"]
  },
  {
    name: "Hôtesses d'accueil & Protocole",
    slug: "hotesses-accueil",
    description: "Service d'accueil, orientation et gestion du placement",
    tags: ["Corporate", "Gala", "Mariage", "Accueil"]
  },
  {
    name: "Sécurité & Gardiennage",
    slug: "securite",
    description: "Agents de sécurité, contrôle d'accès et protection d'événement",
    tags: ["Concert", "Événement", "Sécurité", "Entreprise"]
  },
  {
    name: "Nettoyage",
    slug: "nettoyage",
    description: "Services d'assainissement et nettoyage de la salle avant et après",
    tags: ["Logistique", "Propreté", "Salle"]
  }
];

async function main() {
  console.log("🚀 Début de la mise à jour des catégories...");
  for (const cat of categoriesData) {
    await prisma.shopCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log(`✅ ${categoriesData.length} catégories créées/mises à jour avec succès.`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors de l'exécution du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });