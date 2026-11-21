import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { CategoryRef, ProductListItem } from "@/lib/types";
import { ProductCard } from "./ProductCard";

/**
 * Other products from the same category: a swipeable row on phones and tablets,
 * a 4-column grid on desktop. Hidden when empty.
 */
export function RelatedProducts({
  products,
  category,
}: {
  products: ProductListItem[];
  category: CategoryRef | null;
}) {
  if (products.length === 0) return null;

  return (
    <Container
      as="section"
      aria-labelledby="related-heading"
      className="py-10 sm:py-14"
    >
      <SectionHeading
        id="related-heading"
        title={
          category ? `More ${category.name.toLowerCase()}` : "You may also like"
        }
        href={category?.slug ? `/category/${category.slug}/` : "/shop/"}
      />
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-3 overflow-x-auto overscroll-x-contain px-4 pt-1 pb-4 sm:-mx-6 sm:scroll-px-6 sm:gap-4 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:p-0 [&::-webkit-scrollbar]:hidden">
        {products.slice(0, 8).map((product) => (
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
