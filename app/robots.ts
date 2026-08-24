import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.octaviaevent.com";

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/concours",
        "/concours/*",
      ],
      disallow: [
        "/api/",
        "/admin/",
        "/tableau-de-bord/",
        "/mon-profil/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}