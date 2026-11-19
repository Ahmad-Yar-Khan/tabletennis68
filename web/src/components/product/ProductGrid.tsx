import type { ProductListItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: ProductListItem[];
  /** How many cards at the start load their photo eagerly (above the fold). */
  priorityCount?: number;
  className?: string;
};

/** Product cards: 2 columns on phones, 3 on tablets, 4 on desktop. */
export function ProductGrid({
  products,
  priorityCount = 0,
  className,
}: ProductGridProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6",
        className,
      )}
    >
      {products.map((product, i) => (
        <li key={product._id}>
          <ProductCard product={product} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
