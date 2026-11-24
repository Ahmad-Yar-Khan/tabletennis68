import { getEffectivePrice } from "./price";
import { matchesTokens, searchHaystack, searchTokens } from "./search";
import type { Brand, Category, ProductListItem } from "./types";

/*
 * Filter / sort / search state for product listings (/shop, /category/…, /brand/…).
 * Pure functions only, so they can be memoised and unit-tested. The state lives in the URL:
 *   ?q=tenergy&category=rubbers,blades&brand=butterfly&min=5000&max=15000&stock=in&sort=price-asc&page=2
 */

/** Products shown per "Show more" step. `page=2` in the URL shows the first 48. */
export const PAGE_SIZE = 24;

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A–Z" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

const SORT_KEYS = new Set<string>(SORT_OPTIONS.map((o) => o.value));
export const DEFAULT_SORT: SortKey = "recommended";

/** Quick price ranges (inclusive). */
export const PRICE_RANGES = [
  { id: "under-5000", label: "Under Rs 5,000", min: null, max: 5000 },
  { id: "5000-15000", label: "Rs 5,000–15,000", min: 5000, max: 15000 },
  { id: "15000-plus", label: "Rs 15,000+", min: 15000, max: null },
] as const;

export type ShopState = {
  q: string;
  categories: string[];
  brands: string[];
  min: number | null;
  max: number | null;
  inStockOnly: boolean;
  sort: SortKey;
  /** How many pages of PAGE_SIZE are shown (1 = the first 24). Resets to 1 when anything else changes. */
  page: number;
};

/** A filter fixed by the page (e.g. the category on /category/rubbers/); hidden from the UI and the URL. */
export type LockedFilter = { type: "category" | "brand"; slug: string };

export const EMPTY_STATE: ShopState = {
  q: "",
  categories: [],
  brands: [],
  min: null,
  max: null,
  inStockOnly: false,
  sort: DEFAULT_SORT,
  page: 1,
};

// --- URL <-> state -----------------------------------------------------------

type ParamsLike = { get(name: string): string | null };

function parseList(value: string | null): string[] {
  if (!value) return [];
  return [
    ...new Set(
      value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
}

function parsePrice(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Whole number ≥ 1; anything else (missing, "abc", "0", "-2") means page 1. Capped to keep the DOM sane. */
function parsePage(value: string | null): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 1 ? Math.min(n, 100) : 1;
}

/** Reads the state from URL search params. Unknown or invalid values fall back to defaults. */
export function parseShopState(
  params: ParamsLike,
  locked?: LockedFilter,
): ShopState {
  const sort = params.get("sort") ?? "";
  return {
    q: (params.get("q") ?? "").trim(),
    categories:
      locked?.type === "category" ? [] : parseList(params.get("category")),
    brands: locked?.type === "brand" ? [] : parseList(params.get("brand")),
    min: parsePrice(params.get("min")),
    max: parsePrice(params.get("max")),
    inStockOnly: params.get("stock") === "in",
    sort: SORT_KEYS.has(sort) ? (sort as SortKey) : DEFAULT_SORT,
    page: parsePage(params.get("page")),
  };
}

/** State → query string without "?" (defaults are left out, so a clean page has a clean URL). */
export function serializeShopState(state: ShopState): string {
  const params = new URLSearchParams();
  if (state.q.trim()) params.set("q", state.q.trim());
  if (state.categories.length)
    params.set("category", state.categories.join(","));
  if (state.brands.length) params.set("brand", state.brands.join(","));
  if (state.min !== null) params.set("min", String(state.min));
  if (state.max !== null) params.set("max", String(state.max));
  if (state.inStockOnly) params.set("stock", "in");
  if (state.sort !== DEFAULT_SORT) params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  // Keep commas readable in shared links (?category=rubbers,blades).
  return params.toString().replace(/%2C/g, ",");
}

/** Number of active filters (search and sort not counted). */
export function countActiveFilters(state: ShopState): number {
  return (
    state.categories.length +
    state.brands.length +
    (state.min !== null || state.max !== null ? 1 : 0) +
    (state.inStockOnly ? 1 : 0)
  );
}

/** True when anything narrows the results (filters or search). */
export function hasActiveFilters(state: ShopState): boolean {
  return countActiveFilters(state) > 0 || state.q !== "";
}

/** Clears filters and search; keeps the sort order. */
export function clearedState(state: ShopState): ShopState {
  return { ...EMPTY_STATE, sort: state.sort };
}

// --- Filtering and sorting ---------------------------------------------------

/** A product with pre-computed values used by the filters (built once per product list). */
export type IndexedProduct = {
  product: ProductListItem;
  haystack: string;
  price: number;
  created: number;
  /** Position in the owner's order (from the query). */
  rank: number;
};

export function indexProducts(products: ProductListItem[]): IndexedProduct[] {
  return products.map((product, rank) => ({
    product,
    haystack: searchHaystack(product.name, product.brand?.name),
    price: getEffectivePrice(product),
    created: Date.parse(product._createdAt) || 0,
    rank,
  }));
}

const nameCollator = new Intl.Collator("en", {
  sensitivity: "base",
  numeric: true,
});

const comparators: Record<
  SortKey,
  (a: IndexedProduct, b: IndexedProduct) => number
> = {
  recommended: (a, b) => a.rank - b.rank,
  newest: (a, b) => b.created - a.created || a.rank - b.rank,
  "price-asc": (a, b) => a.price - b.price || a.rank - b.rank,
  "price-desc": (a, b) => b.price - a.price || a.rank - b.rank,
  name: (a, b) => nameCollator.compare(a.product.name, b.product.name),
};

/** Applies search, filters and sort. Returns a new array of products. */
export function filterProducts(
  index: IndexedProduct[],
  state: ShopState,
): ProductListItem[] {
  const tokens = searchTokens(state.q);
  const categories = new Set(state.categories);
  const brands = new Set(state.brands);
  // Tolerate min > max (e.g. typed the wrong way round).
  let { min, max } = state;
  if (min !== null && max !== null && min > max) [min, max] = [max, min];

  const matches = index.filter((item) => {
    const p = item.product;
    if (state.inStockOnly && !p.inStock) return false;
    if (
      categories.size &&
      !(p.category?.slug && categories.has(p.category.slug))
    )
      return false;
    if (brands.size && !(p.brand?.slug && brands.has(p.brand.slug)))
      return false;
    if (min !== null && item.price < min) return false;
    if (max !== null && item.price > max) return false;
    return matchesTokens(item.haystack, tokens);
  });

  return matches.sort(comparators[state.sort]).map((item) => item.product);
}

/** True when two states differ in anything other than the page (filters, search or sort). */
export function filtersDiffer(a: ShopState, b: ShopState): boolean {
  return (
    serializeShopState({ ...a, page: 1 }) !==
    serializeShopState({ ...b, page: 1 })
  );
}

/** Only counts the matches (for "Show N results" while editing filters). */
export function countMatches(
  index: IndexedProduct[],
  state: ShopState,
): number {
  return filterProducts(index, { ...state, sort: DEFAULT_SORT }).length;
}

// --- Facets ------------------------------------------------------------------

export type FacetOption = { slug: string; name: string; count: number };

/**
 * Categories and brands that have products in this list, with counts.
 * Categories keep the owner's order, brands are A–Z (the order of the queries).
 */
export function buildFacets(
  products: ProductListItem[],
  categories: Category[],
  brands: Brand[],
): { categories: FacetOption[]; brands: FacetOption[] } {
  const categoryCounts = new Map<string, number>();
  const brandCounts = new Map<string, number>();
  for (const p of products) {
    if (p.category?.slug) {
      categoryCounts.set(
        p.category.slug,
        (categoryCounts.get(p.category.slug) ?? 0) + 1,
      );
    }
    if (p.brand?.slug) {
      brandCounts.set(p.brand.slug, (brandCounts.get(p.brand.slug) ?? 0) + 1);
    }
  }
  const toOptions = (
    items: { slug: string; name: string }[],
    counts: Map<string, number>,
  ) =>
    items
      .filter((item) => counts.has(item.slug))
      .map((item) => ({
        slug: item.slug,
        name: item.name,
        count: counts.get(item.slug)!,
      }));

  return {
    categories: toOptions(categories, categoryCounts),
    brands: toOptions(brands, brandCounts),
  };
}

// --- Labels ------------------------------------------------------------------

/** "1 product" / "24 products". */
export function productCountLabel(count: number): string {
  return `${count} ${count === 1 ? "product" : "products"}`;
}
