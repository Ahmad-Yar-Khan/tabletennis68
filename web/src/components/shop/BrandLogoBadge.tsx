import { hasImage, urlForImage } from "@/lib/sanity/image";
import type { Brand } from "@/lib/types";

const LOGO_HEIGHT = 56;

/** White card with the brand's logo, for the brand page header. Renders nothing without a logo. */
export function BrandLogoBadge({ brand }: { brand: Brand }) {
  if (!hasImage(brand.logo)) return null;

  return (
    <div className="inline-flex h-20 items-center rounded-card bg-white px-6 shadow-lift sm:h-24 sm:px-8">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export: sized via the Sanity CDN */}
      <img
        src={urlForImage(brand.logo)
          .height(LOGO_HEIGHT * 2)
          .fit("max")
          .auto("format")
          .url()}
        alt={brand.logo.alt || `${brand.name} logo`}
        height={LOGO_HEIGHT}
        width={LOGO_HEIGHT * 3}
        fetchPriority="high"
        decoding="async"
        className="h-10 w-auto max-w-44 object-contain sm:h-14 sm:max-w-56"
      />
    </div>
  );
}
