import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { SanityImage } from "@/components/ui/SanityImage";
import { hasImage } from "@/lib/sanity/image";
import type { ProductListItem } from "@/lib/types";
import { cn, getDiscountPercent, productPath } from "@/lib/utils";
import { ProductPrice } from "./ProductPrice";

type ProductCardProps = {
  product: ProductListItem;
  /** Load the photo eagerly (only for cards visible on first paint). */
  priority?: boolean;
  className?: string;
};

/** Cards are at most ~300 px wide; 400 px (+ 800 px for 2x screens) covers every layout. */
const IMAGE_WIDTH = 400;
const IMAGE_SIZES =
  "(min-width: 1280px) 300px, (min-width: 1024px) 23vw, (min-width: 768px) 31vw, 46vw";

/**
 * Product tile: square photo, badges, brand, name (2 lines) and price.
 * The whole card is one link. On hover (mouse only) it lifts and shows the second photo.
 */
export function ProductCard({
  product,
  priority = false,
  className,
}: ProductCardProps) {
  const { name, slug, brand, price, salePrice, inStock, isNew } = product;
  const discount = getDiscountPercent(product);
  const hoverImage = hasImage(product.hoverImage) ? product.hoverImage : null;

  return (
    <Link
      href={productPath(slug)}
      // Grids show dozens of cards: prefetching each one as it scrolls into view cost ~3 MB
      // of mobile data on /shop/. The product page is fetched when the card is tapped instead.
      prefetch={false}
      className={cn(
        "group relative flex h-full flex-col rounded-card bg-white shadow-card transition-transform duration-300 ease-out hover:-translate-y-1",
        // Bigger shadow fades in on hover (opacity only, no box-shadow animation).
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-card after:opacity-0 after:shadow-lift after:transition-opacity after:duration-300 hover:after:opacity-100",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-card bg-white">
        <SanityImage
          image={product.image}
          width={IMAGE_WIDTH}
          sizes={IMAGE_SIZES}
          fallbackAlt={name}
          priority={priority}
          className={cn(
            "absolute inset-0 size-full object-contain p-3 transition-opacity duration-300 sm:p-4",
            hoverImage && "group-hover:opacity-0",
            !inStock && "opacity-60",
          )}
        />
        {hoverImage && (
          // display:none on touch screens, so the browser never downloads it there.
          <SanityImage
            image={hoverImage}
            width={IMAGE_WIDTH}
            sizes={IMAGE_SIZES}
            fallbackAlt=""
            className="absolute inset-0 hidden size-full object-contain p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:p-4 [@media(hover:hover)]:block"
          />
        )}

        {(discount > 0 || isNew || !inStock) && (
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1.5 sm:top-3 sm:left-3">
            {!inStock && <Badge variant="out-of-stock" />}
            {discount > 0 && <Badge variant="sale" percent={discount} />}
            {isNew && <Badge variant="new" />}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 border-t border-line/60 p-3 sm:p-4">
        {brand?.name && (
          <p className="truncate text-xs font-medium tracking-wider text-muted uppercase">
            {brand.name}
          </p>
        )}
        <h3 className="line-clamp-2 min-h-[2.5em] font-sans text-sm leading-tight font-medium text-ink not-italic sm:text-base sm:leading-tight">
          {name}
        </h3>
        <ProductPrice
          price={price}
          salePrice={salePrice}
          className="mt-auto pt-1"
        />
      </div>
    </Link>
  );
}
