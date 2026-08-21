// lib/algolia.ts
import { algoliasearch } from "algoliasearch";

const appId = process.env.ALGOLIA_APP_ID!;
const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY!;
const indexName = process.env.ALGOLIA_INDEX_NAME!;

// Client d'administration pour l'indexation (Server-side uniquement)
export const algoliaClient = algoliasearch(appId, adminApiKey);

// Configuration de l'index (Syntaxe v5 TypeScript validée)
export async function configureAlgoliaIndex() {
  await algoliaClient.setSettings({
    indexName: indexName,
    indexSettings: { // C'est "indexSettings" la clé attendue en v5 !
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
    },
  });
}
