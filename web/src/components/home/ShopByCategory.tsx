import { Package } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SanityImage } from "@/components/ui/SanityImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { hasImage } from "@/lib/sanity/image";
import type { Category } from "@/lib/types";

/**
 * Illustration (in /public/categories) shown when the owner hasn't uploaded a category photo.
 * Matched on the category name, so renamed or new categories still find a fitting picture.
 */
const fallbackArt: [RegExp, string][] = [
  [/blade/i, "blade"],
  [/racket|bat|paddle/i, "racket"],
  [/rubber/i, "rubber"],
  [/ball/i, "ball"],
  [/shoe/i, "shoe"],
  [/bag|case/i, "bag"],
  [/table|net/i, "table"],
  [/grip|accessor/i, "grip"],
];

function artFor(name: string): string | null {
  return fallbackArt.find(([pattern]) => pattern.test(name))?.[1] ?? null;
}

/** Category tiles (photo, or an illustration when there's no photo). Hidden when there are no categories. */
export function ShopByCategory({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <Container
      as="section"
      aria-labelledby="shop-by-category"
      className="py-10 sm:py-14 lg:py-16"
    >
      <SectionHeading
        id="shop-by-category"
        title="Shop by category"
        href="/shop/"
        linkLabel="All products"
      />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        {categories.map((category) => {
          const art = artFor(category.name);
          return (
            <li key={category._id}>
              <Link
                href={`/category/${category.slug}/`}
                className="group relative flex h-full flex-col overflow-hidden rounded-card bg-white shadow-card transition-transform duration-300 ease-out after:pointer-events-none after:absolute after:inset-0 after:rounded-card after:opacity-0 after:shadow-lift after:transition-opacity after:duration-300 hover:-translate-y-1 hover:after:opacity-100"
              >
                <div className="relative aspect-[3/2] overflow-hidden sm:aspect-[4/3]">
                  {hasImage(category.image) ? (
                    <SanityImage
                      image={category.image}
                      width={320}
                      aspectRatio={4 / 3}
                      sizes="(min-width: 1280px) 300px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 46vw"
                      className="absolute inset-0 size-full transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-blush text-crimson">
                      {/* Thin "table line" motif behind the picture */}
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-1/2 w-px bg-crimson/15"
                      />
                      {art ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/categories/${art}.svg`}
                          alt=""
                          width={400}
                          height={400}
                          loading="lazy"
                          decoding="async"
                          className="relative h-[88%] w-auto transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                        />
                      ) : (
                        <Package
                          aria-hidden
                          className="relative size-10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 sm:size-12"
                        />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-center px-3 py-2.5 sm:px-4 sm:py-3">
                  <h3 className="text-lg leading-tight uppercase sm:text-xl">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted sm:text-sm">
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "product" : "products"}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
