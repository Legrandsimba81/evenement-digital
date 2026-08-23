import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://octaviaevent.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",          // Interdit d'indexer vos routes d'API internes
        "/admin/",        // Interdit d'indexer votre espace d'administration
        "/tableau-de-bord/", // Interdit d'indexer les pages privées des utilisateurs
        "/mon-profil/",   // Interdit d'indexer les profils utilisateur privés
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
