import { ProductGrid } from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/Skeleton";
import { PAGE_SIZE, productCountLabel } from "@/lib/shop";
import type { ProductListItem } from "@/lib/types";
import { ShowMore } from "./ShowMore";

/**
 * Server-rendered stand-in shown in the static HTML until the browser reads the URL filters.
 * Lists the first page of products (keeps the HTML small) in the same layout as ProductBrowser,
 * so nothing jumps when the interactive version takes over.
 */
export function ProductBrowserFallback({
  products,
}: {
  products: ProductListItem[];
}) {
  return (
    <div>
      <div className="min-w-0">
        <Skeleton className="h-12 w-full rounded-pill" />
        <div className="mt-3 flex min-h-16 items-center justify-between gap-3 py-2 lg:mt-4">
          <Skeleton className="h-11 w-40 rounded-pill lg:w-36" />
          <Skeleton className="hidden h-11 w-52 rounded-pill lg:block" />
          <p className="text-sm font-medium tabular-nums lg:ml-auto lg:text-base">
            {productCountLabel(products.length)}
          </p>
        </div>
        <ProductGrid
          products={products.slice(0, PAGE_SIZE)}
          priorityCount={4}
          className="mt-4"
        />
        <ShowMore
          shown={Math.min(PAGE_SIZE, products.length)}
          total={products.length}
        />
      </div>
    </div>
  );
}
