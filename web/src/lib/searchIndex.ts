import {
  matchesTokens,
  searchHaystack,
  SEARCH_INDEX_PATH,
  type SearchItem,
} from "./search";

/*
 * Client-side loader for /search-index.json (built by app/search-index.json/route.ts).
 * Loaded once per visit, the first time the header search is opened (or hovered/focused).
 */

export type IndexedSearchItem = SearchItem & { haystack: string };

let cache: Promise<IndexedSearchItem[] | null> | null = null;
let failed = false;

/**
 * The search index, or null if it couldn't be loaded (offline etc.); the UI then falls back
 * to /shop/?q=…. Always returns the same promise, as React's `use()` requires.
 */
export function loadSearchIndex(): Promise<IndexedSearchItem[] | null> {
  cache ??= fetch(SEARCH_INDEX_PATH)
    .then((res) => {
      if (!res.ok) throw new Error(`Search index: HTTP ${res.status}`);
      return res.json() as Promise<SearchItem[]>;
    })
    .then((items) =>
      items.map((item) => ({
        ...item,
        haystack: searchHaystack(item.name, item.brand),
      })),
    )
    .catch(() => {
      failed = true;
      return null;
    });
  return cache;
}

/** Call before opening the search: if the last load failed, the next one tries again. */
export function retrySearchIndexIfFailed(): void {
  if (failed) {
    failed = false;
    cache = null;
  }
}

/** Matches, best first: names that start with the first word typed, then the rest. */
export function searchIndex(
  items: IndexedSearchItem[],
  tokens: string[],
): IndexedSearchItem[] {
  if (tokens.length === 0) return [];
  const first = tokens[0];
  const starts: IndexedSearchItem[] = [];
  const others: IndexedSearchItem[] = [];
  for (const item of items) {
    if (!matchesTokens(item.haystack, tokens)) continue;
    (item.haystack.startsWith(first) ? starts : others).push(item);
  }
  return [...starts, ...others];
}
