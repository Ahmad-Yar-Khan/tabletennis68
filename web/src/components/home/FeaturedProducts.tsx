import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ProductListItem } from "@/lib/types";

/** Grid of products the owner marked "featured". Hidden when there are none. */
export function FeaturedProducts({
  products,
}: {
  products: ProductListItem[];
}) {
  if (products.length === 0) return null;

  return (
    <Container
      as="section"
      aria-labelledby="featured-products"
      className="py-10 sm:py-14 lg:py-16"
    >
      <SectionHeading
        id="featured-products"
        title="Featured gear"
        subtitle="Hand-picked by our players."
        href="/shop/"
      />
      <ProductGrid products={products} />
    </Container>
  );
}
