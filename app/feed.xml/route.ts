// // app/feed.xml/route.ts
// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

// export const dynamic = "force-dynamic";

// export async function GET() {
//   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://evenement-digital.vercel.app";

//   const posts = await prisma.blogPost.findMany({
//     where: { published: true },
//     orderBy: { publishedAt: "desc" },
//     take: 20,
//     select: {
//       title: true,
//       slug: true,
//       excerpt: true,
//       content: true,
//       publishedAt: true,
//       updatedAt: true,
//       imageUrl: true,
//       tags: true,
//     },
//   });

//   const feedItems = posts.map((post) => {
//     const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date().toUTCString();
//     const updatedDate = post.updatedAt ? new Date(post.updatedAt).toUTCString() : pubDate;
//     const content = post.content || post.excerpt || "";
//     // Nettoyer le HTML pour le flux RSS
//     const cleanContent = content.replace(/<[^>]*>/g, "").slice(0, 5000);
//     const description = post.excerpt || cleanContent.slice(0, 300);

//     return `
//       <item>
//         <title><![CDATA[${post.title}]]></title>
//         <link>${baseUrl}/blog/${post.slug}</link>
//         <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
//         <pubDate>${pubDate}</pubDate>
//         <lastBuildDate>${updatedDate}</lastBuildDate>
//         <description><![CDATA[${description}]]></description>
//         <content:encoded><![CDATA[${content}]]></content:encoded>
//         ${post.imageUrl ? `<enclosure url="${post.imageUrl}" type="image/jpeg" />` : ""}
//         ${post.tags.map((tag) => `<category><![CDATA[${tag}]]></category>`).join("")}
//       </item>
//     `;
//   });

//   const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
// <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
//   <channel>
//     <title>Octavia Event - Blog</title>
//     <link>${baseUrl}/blog</link>
//     <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
//     <description>Astuces, actualités et inspirations pour vos événements</description>
//     <language>fr</language>
//     <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
//     ${feedItems.join("")}
//   </channel>
// </rss>`;

//   return new NextResponse(rssFeed, {
//     headers: {
//       "Content-Type": "application/rss+xml; charset=utf-8",
//       "Cache-Control": "s-maxage=3600, stale-while-revalidate",
//     },
//   });
// }