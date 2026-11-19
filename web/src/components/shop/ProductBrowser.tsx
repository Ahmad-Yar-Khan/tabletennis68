import { Suspense } from "react";
import { buildFacets, type LockedFilter } from "@/lib/shop";
import type { Brand, Category, ProductListItem } from "@/lib/types";
import { ProductBrowserClient } from "./ProductBrowserClient";
import { ProductBrowserFallback } from "./ProductBrowserFallback";

type ProductBrowserProps = {
  /** Products to browse, already narrowed by the page if it has a locked filter. */
  products: ProductListItem[];
  /** All categories and brands (for filter names and order); empty ones are hidden. */
  categories: Category[];
  brands: Brand[];
  /** Fixed filter for /category/[slug] or /brand/[slug]: hidden from the filters and URL. */
  locked?: LockedFilter;
  whatsappNumber: string | null;
  searchPlaceholder?: string;
};

/**
 * Searchable, filterable, sortable product listing (server component wrapper).
 * State lives in the URL (?q=…&category=…), read with useSearchParams, which a static export
 * requires inside <Suspense>. The fallback is a plain grid of every product, so the static
 * HTML still has the full listing before JavaScript loads.
 */
export function ProductBrowser({
  products,
  categories,
  brands,
  locked,
  whatsappNumber,
  searchPlaceholder,
}: ProductBrowserProps) {
  const facets = buildFacets(products, categories, brands);

  return (
    <Suspense fallback={<ProductBrowserFallback products={products} />}>
      <ProductBrowserClient
        products={products}
        facets={facets}
        locked={locked}
        whatsappNumber={whatsappNumber}
        searchPlaceholder={searchPlaceholder}
      />
    </Suspense>
  );
}
