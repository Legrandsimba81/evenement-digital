// lib/algolia.ts
import algoliasearch from "algoliasearch";

const appId = process.env.ALGOLIA_APP_ID!;
const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY!;

export const algoliaClient = algoliasearch(appId, adminApiKey);
export const searchClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_SEARCH_API_KEY!
);

export const shopsIndex = algoliaClient.initIndex(process.env.ALGOLIA_INDEX_NAME!);

// Configuration de l'index
export async function configureAlgoliaIndex() {
  await shopsIndex.setSettings({
    searchableAttributes: [
      "name",
      "description",
      "city",
      "province",
      "category.name",
      "tags",
    ],
    attributesForFaceting: [
      "category.name",
      "city",
      "province",
      "isVerified",
      "priceRange",
    ],
    hitsPerPage: 12,
    ranking: ["desc(popularity)", "asc(name)"],
  });
}