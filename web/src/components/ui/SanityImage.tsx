import {
  hasImage,
  imageAspectRatio,
  imageSrcSet,
  imageUrl,
} from "@/lib/sanity/image";
import type { SanityImage as SanityImageData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "./ImagePlaceholder";

type SanityImageProps = {
  image: SanityImageData | null | undefined;
  /** Largest width (CSS px) this image is shown at, e.g. 400 for cards, 1000 for the gallery. */
  width: number;
  /** Crop to this aspect ratio (width / height), centred on the hotspot. Omit to keep the photo's own. */
  aspectRatio?: number;
  /** Responsive `sizes`, e.g. "(min-width: 1024px) 25vw, 50vw". */
  sizes?: string;
  /** Used when the image has no alt text (e.g. the product name). */
  fallbackAlt?: string;
  /** Above-the-fold images: load eagerly with high priority. */
  priority?: boolean;
  className?: string;
};

/**
 * Sanity image at the size actually displayed (1x and 2x srcset, auto format),
 * or the table-tennis placeholder when there is no photo.
 */
export function SanityImage({
  image,
  width,
  aspectRatio,
  sizes,
  fallbackAlt = "",
  priority = false,
  className,
}: SanityImageProps) {
  if (!hasImage(image)) {
    return (
      <ImagePlaceholder
        label={fallbackAlt || undefined}
        aspectRatio={aspectRatio ?? 1}
        className={className}
      />
    );
  }

  const ratio = aspectRatio ?? imageAspectRatio(image);
  const height = Math.round(width / ratio);
  const src =
    imageUrl(image, width, { height: aspectRatio ? height : undefined }) ??
    undefined;

  return (
    // next/image optimisation is off for static export; we size via the Sanity CDN instead.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={imageSrcSet(image, [width, width * 2], aspectRatio)}
      sizes={sizes ?? `${width}px`}
      width={width}
      height={height}
      alt={image.alt ?? fallbackAlt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cn("h-auto w-full object-cover", className)}
    />
  );
}
