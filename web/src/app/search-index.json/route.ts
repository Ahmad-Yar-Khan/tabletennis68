import { sanityFetch } from "@/lib/sanity/client";
import { imageUrl } from "@/lib/sanity/image";
import { allProductsQuery } from "@/lib/sanity/queries";
import type { SearchItem } from "@/lib/search";
import type { ProductListItem } from "@/lib/types";

/*
 * Static file /search-index.json, written at build time (like sitemap.xml; no server involved).
 * The header search loads it only when opened, so product data isn't embedded in every page.
 */
export const dynamic = "force-static";

const THUMB_SIZE = 112; // shown at 56 px; 2x for sharp phone screens

export async function GET() {
  const products = await sanityFetch<ProductListItem[]>(allProductsQuery);
  const items: SearchItem[] = products.map((p) => ({
    id: p._id,
    name: p.name,
    slug: p.slug,
    brand: p.brand?.name ?? null,
    category: p.category?.name ?? null,
    price: p.price,
    salePrice: p.salePrice,
    inStock: p.inStock,
    thumb: imageUrl(p.image, THUMB_SIZE, { height: THUMB_SIZE }),
  }));
  return Response.json(items);
}
