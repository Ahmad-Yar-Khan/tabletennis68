import { ProductCard } from "@/components/product/ProductCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ProductListItem } from "@/lib/types";

/**
 * New products: a swipeable row on phones and tablets (the next card peeks in), a 4-column grid on desktop.
 * Expects at most 8 products, newest first. Hidden when empty.
 */
export function NewArrivals({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) return null;

  return (
    <Container
      as="section"
      aria-labelledby="new-arrivals"
      className="py-10 sm:py-14 lg:py-16"
    >
      <SectionHeading
        id="new-arrivals"
        title="New arrivals"
        subtitle="Fresh in the shop."
        href="/shop/?sort=newest"
      />
      {/* Bleeds to the screen edges on phones so cards scroll edge to edge. pt/pb leave room for the hover lift and shadow. */}
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pt-1 pb-4 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:gap-4 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:p-0 [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <li
            key={product._id}
            className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-auto"
          >
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
