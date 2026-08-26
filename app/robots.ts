import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    // Dans robots.ts et sitemap.ts
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://octaviaevent.com";
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