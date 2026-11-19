/*
 * Text search shared by the /shop filters and the header search overlay.
 * Matches product name + brand, case- and accent-insensitive; every word typed must appear.
 */

/** Lower-case, strip accents and collapse whitespace. */
export function normaliseText(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** "  Butterfly  Tenergy " → ["butterfly", "tenergy"]. */
export function searchTokens(query: string): string[] {
  const text = normaliseText(query);
  return text ? text.split(" ") : [];
}

/** The searchable text of a product: its name and brand, normalised. */
export function searchHaystack(name: string, brand?: string | null): string {
  return normaliseText(brand ? `${name} ${brand}` : name);
}

/** True when every token appears somewhere in the haystack (no tokens = match). */
export function matchesTokens(haystack: string, tokens: string[]): boolean {
  return tokens.every((token) => haystack.includes(token));
}

/** One product in /search-index.json (built at build time, loaded by the header search). */
export type SearchItem = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  category: string | null;
  price: number;
  salePrice: number | null;
  inStock: boolean;
  /** Small square thumbnail URL from the Sanity CDN, or null when there is no photo. */
  thumb: string | null;
};

export const SEARCH_INDEX_PATH = "/search-index.json";
