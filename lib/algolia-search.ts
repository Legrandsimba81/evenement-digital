// lib/algolia-search.ts
"use client";

import { algoliasearch } from "algoliasearch";

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const searchApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!;

// Client de recherche public
export const searchClient = algoliasearch(appId, searchApiKey);
