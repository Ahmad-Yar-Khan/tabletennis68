import { cache } from "react";
import type {
  Banner,
  Brand,
  Category,
  ProductDetail,
  ProductListItem,
  SiteSettings,
} from "@/lib/types";
import { sanityFetch } from "./client";
import { siteContentQuery } from "./queries";

/*
 * All website content, loaded from Sanity with ONE request and shared by every page.
 *
 * `next build` renders pages in a few worker processes. Each process fetches the content once
 * (the promise below is kept at module level), so a build makes a handful of requests no matter
 * how many products there are. Previously each page ran its own queries.
 *
 * In `next dev` the content is fetched again for every page load, so edits in the Studio show
 * up on refresh (React's `cache` still shares one fetch between the layout and the page).
 */

const RELATED_LIMIT = 8;

/** A product as returned by `siteContentQuery`: card fields + detail fields. */
type ProductResult = ProductListItem &
  Omit<ProductDetail, keyof ProductListItem | "related"> & {
    categoryId: string | null;
  };

/** Raw result of `siteContentQuery`. */
type SiteContentResult = {
  products: ProductResult[];
  categories: Category[];
  brands: Brand[];
  banners: Banner[];
  settings: SiteSettings | null;
};

type ProductExtras = Omit<ProductDetail, keyof ProductListItem | "related">;

export type SiteContent = {
  /** Card data for listings, in the owner's order (same shape as before). */
  products: ProductListItem[];
  categories: Category[];
  brands: Brand[];
  banners: Banner[];
  settings: SiteSettings | null;
  /** Full product pages by slug, with related products filled in. */
  productsBySlug: Map<string, ProductDetail>;
};

function buildContent(result: SiteContentResult): SiteContent {
  const cards: ProductListItem[] = [];
  const extras: ProductExtras[] = [];
  const categoryIds: (string | null)[] = [];

  for (const product of result.products) {
    const { categoryId, images, description, options, specs, ...card } =
      product;
    cards.push(card);
    extras.push({ images, description, options, specs });
    categoryIds.push(categoryId);
  }

  // Related = other products in the same category, in the owner's order, max 8
  // (what the old per-product GROQ sub-query returned).
  const productsBySlug = new Map<string, ProductDetail>();
  cards.forEach((card, i) => {
    const categoryId = categoryIds[i];
    const related = categoryId
      ? cards
          .filter((other, j) => j !== i && categoryIds[j] === categoryId)
          .slice(0, RELATED_LIMIT)
      : [];
    productsBySlug.set(card.slug, { ...card, ...extras[i], related });
  });

  return {
    products: cards,
    categories: result.categories,
    brands: result.brands,
    banners: result.banners,
    settings: result.settings,
    productsBySlug,
  };
}

async function fetchContent(): Promise<SiteContent> {
  return buildContent(await sanityFetch<SiteContentResult>(siteContentQuery));
}

let buildCache: Promise<SiteContent> | null = null;

/** All content. One Sanity request per build process (per page load in dev). */
export const getSiteContent = cache((): Promise<SiteContent> => {
  if (process.env.NODE_ENV === "development") return fetchContent();
  buildCache ??= fetchContent().catch((error: unknown) => {
    buildCache = null; // let a later call retry instead of reusing the failure
    throw error;
  });
  return buildCache;
});

// --- Small helpers for pages -------------------------------------------------

export async function getProducts(): Promise<ProductListItem[]> {
  return (await getSiteContent()).products;
}

export async function getCategories(): Promise<Category[]> {
  return (await getSiteContent()).categories;
}

export async function getBrands(): Promise<Brand[]> {
  return (await getSiteContent()).brands;
}

export async function getBanners(): Promise<Banner[]> {
  return (await getSiteContent()).banners;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return (await getSiteContent()).settings;
}

/** One product page's data, or null when there is no product with that web address. */
export async function getProduct(slug: string): Promise<ProductDetail | null> {
  return (await getSiteContent()).productsBySlug.get(slug) ?? null;
}
