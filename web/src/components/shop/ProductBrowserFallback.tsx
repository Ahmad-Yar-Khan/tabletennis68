import { ProductGrid } from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/Skeleton";
import { productCountLabel } from "@/lib/shop";
import type { ProductListItem } from "@/lib/types";

/**
 * Server-rendered stand-in shown in the static HTML until the browser reads the URL filters.
 * Lists every product (good for SEO and first paint) in the same layout as ProductBrowser,
 * so nothing jumps when the interactive version takes over.
 */
export function ProductBrowserFallback({
  products,
}: {
  products: ProductListItem[];
}) {
  return (
    <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[16rem_minmax(0,1fr)] xl:gap-10">
      <div aria-hidden className="hidden space-y-3 lg:block">
        <Skeleton className="h-6 w-24" />
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
      <div className="min-w-0">
        <Skeleton className="h-12 w-full rounded-pill" />
        <div className="mt-3 flex min-h-16 items-center justify-between gap-3 py-2 lg:mt-4">
          <Skeleton className="h-11 w-40 rounded-pill lg:hidden" />
          <p className="text-sm font-medium tabular-nums lg:text-base">
            {productCountLabel(products.length)}
          </p>
          <Skeleton className="hidden h-11 w-52 rounded-pill lg:block" />
        </div>
        <ProductGrid
          products={products}
          priorityCount={4}
          className="mt-4 md:grid-cols-3 lg:grid-cols-3 lg:gap-5 xl:gap-6"
        />
      </div>
    </div>
  );
}
