"use client";

import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { imageSrcSet, imageUrl } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductZoomViewer } from "./ProductZoomViewer";

export type GalleryImage = SanityImage & { _key: string };

type ProductGalleryProps = {
  /** Photos with an uploaded file; the first is the main photo. May be empty. */
  images: GalleryImage[];
  productName: string;
};

/** The gallery column is at most ~600 px wide; 1000 px covers 2x screens without waste. */
const MAIN_WIDTHS = [600, 1000, 1600];
const MAIN_SIZES = "(min-width: 1280px) 600px, (min-width: 1024px) 46vw, 100vw";
const THUMB_PX = 72;

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

/**
 * Product photos: a swipeable main image (native scroll-snap), thumbnails, and a
 * full-screen zoom view on tap. Keyboard: Tab to the photo, ←/→ to change, Enter to zoom.
 */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const count = images.length;

  if (count === 0) {
    return (
      <div className="overflow-hidden rounded-card bg-white shadow-card">
        <ImagePlaceholder label={productName} aspectRatio={1} />
      </div>
    );
  }

  const altFor = (i: number) =>
    images[i].alt ||
    (count > 1 ? `${productName}, photo ${i + 1} of ${count}` : productName);

  function goTo(index: number, { focus = false } = {}) {
    const track = trackRef.current;
    if (!track) return;
    const next = (index + count) % count;
    track.scrollTo({
      left: next * track.clientWidth,
      behavior: scrollBehavior(),
    });
    setActive(next);
    if (focus) slideRefs.current[next]?.focus({ preventScroll: true });
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  }

  function onKeyDown(event: KeyboardEvent) {
    const moves: Record<string, number> = {
      ArrowLeft: active - 1,
      ArrowRight: active + 1,
      Home: 0,
      End: count - 1,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    goTo(moves[event.key], { focus: true });
  }

  function closeZoom(lastIndex: number) {
    setZoomIndex(null);
    // Leave the gallery on the photo the customer ended on, without animating.
    const track = trackRef.current;
    if (track) track.scrollTo({ left: lastIndex * track.clientWidth });
    setActive(lastIndex);
  }

  const arrowClass =
    "absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-card transition hover:bg-white hover:text-crimson [@media(hover:hover)]:flex";

  return (
    <div className="flex flex-col gap-3">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={`${productName} photos`}
        className="group relative overflow-hidden rounded-card bg-white shadow-card"
      >
        <div
          ref={trackRef}
          onScroll={onScroll}
          onKeyDown={onKeyDown}
          className="flex aspect-square snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, i) => (
            <button
              key={image._key}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              type="button"
              tabIndex={i === active ? 0 : -1}
              aria-roledescription="slide"
              aria-label={`Zoom photo ${i + 1} of ${count}`}
              onClick={() => setZoomIndex(i)}
              className="relative size-full shrink-0 cursor-zoom-in snap-center snap-always focus-visible:-outline-offset-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- sized via the Sanity CDN (static export). */}
              <img
                src={imageUrl(image, 1000) ?? undefined}
                srcSet={imageSrcSet(image, MAIN_WIDTHS)}
                sizes={MAIN_SIZES}
                width={1000}
                height={1000}
                alt={altFor(i)}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
                decoding={i === 0 ? "sync" : "async"}
                draggable={false}
                className="size-full object-contain p-4 sm:p-8"
              />
            </button>
          ))}
        </div>

        <span
          aria-hidden
          className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-pill bg-ink/75 px-2.5 py-1 text-xs font-medium text-white tabular-nums"
        >
          <Expand className="size-3.5" />
          {count > 1 ? `${active + 1} / ${count}` : "Zoom"}
        </span>

        {count > 1 && (
          <>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => goTo(active - 1)}
              className={cn(arrowClass, "left-3")}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => goTo(active + 1)}
              className={cn(arrowClass, "right-3")}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <ul
          aria-label="Choose a photo"
          className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, i) => (
            <li key={image._key} className="shrink-0">
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === active ? "true" : undefined}
                className={cn(
                  "block size-16 overflow-hidden rounded-xl border-2 bg-white transition-colors sm:size-18",
                  i === active
                    ? "border-red"
                    : "border-transparent hover:border-line",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- sized via the Sanity CDN (static export). */}
                <img
                  src={
                    imageUrl(image, THUMB_PX * 2, { height: THUMB_PX * 2 }) ??
                    undefined
                  }
                  width={THUMB_PX}
                  height={THUMB_PX}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-contain p-1"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {zoomIndex !== null && (
        <ProductZoomViewer
          images={images}
          startIndex={zoomIndex}
          altFor={altFor}
          productName={productName}
          onClose={closeZoom}
        />
      )}
    </div>
  );
}
