import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { hasImage, urlForImage } from "@/lib/sanity/image";
import type { Brand } from "@/lib/types";

const LOGO_HEIGHT = 28;

/** Brand chips linking to each brand page: the logo if uploaded, else the name. Hidden when empty. */
export function ShopByBrand({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;

  return (
    <Container
      as="section"
      aria-labelledby="shop-by-brand"
      className="py-10 sm:py-14 lg:py-16"
    >
      <SectionHeading id="shop-by-brand" title="Shop by brand" />
      <ul className="flex flex-wrap gap-2 sm:gap-3">
        {brands.map((brand) => (
          <li key={brand._id}>
            <Link
              href={`/brand/${brand.slug}/`}
              className="inline-flex min-h-12 items-center rounded-pill border-2 border-line bg-white px-5 font-display text-xl font-bold text-ink uppercase italic transition-colors hover:border-red hover:text-crimson sm:min-h-14 sm:px-7 sm:text-2xl"
            >
              {hasImage(brand.logo) ? (
                // eslint-disable-next-line @next/next/no-img-element -- static export: sized via the Sanity CDN
                <img
                  src={urlForImage(brand.logo)
                    .height(LOGO_HEIGHT * 2)
                    .fit("max")
                    .auto("format")
                    .url()}
                  alt={brand.logo.alt || brand.name}
                  height={LOGO_HEIGHT}
                  width={LOGO_HEIGHT * 3}
                  loading="lazy"
                  decoding="async"
                  className="h-7 w-auto max-w-32 object-contain"
                />
              ) : (
                brand.name
              )}
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
