import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import type { SanityImage } from "@/lib/types";
import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

/** Raw image URL builder. Crop and hotspot from the source are applied automatically. */
export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}

/** True when the image actually has an uploaded asset (demo products have none). */
export function hasImage(
  image: SanityImage | null | undefined,
): image is SanityImage {
  return Boolean(image?.asset?._id);
}

type ImageUrlOptions = {
  /** Set to crop to an exact box. The crop centres on the owner's hotspot. */
  height?: number;
  quality?: number;
};

/**
 * URL for an image at a given display width, with `auto=format` (WebP/AVIF where supported).
 * Without `height`: fit=max (never upscaled, keeps aspect ratio, respects the owner's crop).
 * With `height`: fit=crop to that box, centred on the hotspot.
 * Returns null when there is no image, so callers can show the placeholder.
 */
export function imageUrl(
  image: SanityImage | null | undefined,
  width: number,
  { height, quality }: ImageUrlOptions = {},
): string | null {
  if (!hasImage(image)) return null;
  let url = urlForImage(image).width(Math.round(width)).auto("format");
  url = height ? url.height(Math.round(height)).fit("crop") : url.fit("max");
  if (quality) url = url.quality(quality);
  return url.url();
}

/** A `srcSet` string for responsive images, e.g. widths [400, 800] → "…400w, …800w". */
export function imageSrcSet(
  image: SanityImage | null | undefined,
  widths: number[],
  aspectRatio?: number,
): string | undefined {
  if (!hasImage(image)) return undefined;
  return widths
    .map((w) => {
      const height = aspectRatio ? w / aspectRatio : undefined;
      return `${imageUrl(image, w, { height })} ${w}w`;
    })
    .join(", ");
}

/** Intrinsic aspect ratio (width / height) after the owner's crop. Falls back to 1 (square). */
export function imageAspectRatio(
  image: SanityImage | null | undefined,
): number {
  const dims = image?.asset?.metadata?.dimensions;
  if (!dims?.width || !dims?.height) return 1;
  const crop = image?.crop;
  const w = dims.width * (1 - (crop?.left ?? 0) - (crop?.right ?? 0));
  const h = dims.height * (1 - (crop?.top ?? 0) - (crop?.bottom ?? 0));
  return w > 0 && h > 0 ? w / h : dims.aspectRatio || 1;
}
