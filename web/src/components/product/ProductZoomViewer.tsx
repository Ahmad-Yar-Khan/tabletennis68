"use client";

import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { m } from "motion/react";
import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { imageAspectRatio, imageSrcSet, imageUrl } from "@/lib/sanity/image";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "./ProductGallery";

type ProductZoomViewerProps = {
  images: GalleryImage[];
  startIndex: number;
  altFor: (index: number) => string;
  productName: string;
  /** Called with the photo the customer ended on. */
  onClose: (lastIndex: number) => void;
};

const ZOOM = 2.5;
const VIEWER_WIDTHS = [800, 1400, 2200];

/** Zoomed photo: its pixel width, and which point (0–1) to centre on after rendering. */
type ZoomState = { width: number; focusX: number; focusY: number } | null;

/**
 * Full-screen photo view. Swipe or ←/→ between photos; tap/click (or Enter) to zoom in
 * at that point, then drag (touch) or move the mouse to look around. Esc zooms out, then closes.
 */
export function ProductZoomViewer({
  images,
  startIndex,
  altFor,
  productName,
  onClose,
}: ProductZoomViewerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = useState(startIndex);
  const [zoom, setZoom] = useState<ZoomState>(null);
  const count = images.length;

  useScrollLock(true);
  useFocusTrap(dialogRef, true, {
    onEscape: () => (zoom ? setZoom(null) : onClose(index)),
  });

  // Open on the photo that was tapped.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = startIndex * track.clientWidth;
  }, [startIndex]);

  // After zooming in, scroll so the tapped point is in the middle of the screen.
  useLayoutEffect(() => {
    const stage = stageRefs.current[index];
    if (!zoom || !stage) return;
    const img = stage.querySelector("img");
    if (!img) return;
    stage.scrollLeft = zoom.focusX * img.offsetWidth - stage.clientWidth / 2;
    stage.scrollTop = zoom.focusY * img.offsetHeight - stage.clientHeight / 2;
  }, [zoom, index]);

  function goTo(next: number) {
    const track = trackRef.current;
    if (!track) return;
    const target = (next + count) % count;
    setZoom(null);
    setIndex(target);
    track.scrollTo({ left: target * track.clientWidth });
  }

  function onTrackScroll() {
    const track = trackRef.current;
    if (!track || zoom || track.clientWidth === 0) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  }

  /** Zoom in centred on (focusX, focusY), given as fractions of the photo. */
  function zoomIn(focusX = 0.5, focusY = 0.5) {
    const stage = stageRefs.current[index];
    if (!stage) return;
    const ratio = imageAspectRatio(images[index]);
    // Width the photo has when it fits the screen, then enlarge that.
    const fitWidth = Math.min(stage.clientWidth, stage.clientHeight * ratio);
    setZoom({ width: fitWidth * ZOOM, focusX, focusY });
  }

  function onImageClick(event: MouseEvent<HTMLImageElement>) {
    if (zoom) {
      setZoom(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    // object-contain letterboxes the photo; work out where it actually sits inside the <img> box.
    const ratio = imageAspectRatio(images[index]);
    const drawnW = Math.min(rect.width, rect.height * ratio);
    const drawnH = drawnW / ratio;
    const left = rect.left + (rect.width - drawnW) / 2;
    const top = rect.top + (rect.height - drawnH) / 2;
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    zoomIn(
      clamp((event.clientX - left) / drawnW),
      clamp((event.clientY - top) / drawnH),
    );
  }

  /** Mouse users pan by moving the pointer (touch users drag-scroll natively). */
  function onStagePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!zoom || event.pointerType !== "mouse") return;
    const stage = event.currentTarget;
    const rect = stage.getBoundingClientRect();
    const fx = (event.clientX - rect.left) / rect.width;
    const fy = (event.clientY - rect.top) / rect.height;
    stage.scrollLeft = fx * (stage.scrollWidth - stage.clientWidth);
    stage.scrollTop = fy * (stage.scrollHeight - stage.clientHeight);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowLeft" && count > 1 && !zoom) {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "ArrowRight" && count > 1 && !zoom) {
      event.preventDefault();
      goTo(index + 1);
    }
  }

  const roundButton =
    "inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20";

  return createPortal(
    <m.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} photos`}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex flex-col bg-ink text-white outline-none"
    >
      <div className="flex items-center justify-between gap-3 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
        <p aria-live="polite" className="pl-2 text-sm font-medium tabular-nums">
          {count > 1 ? `${index + 1} / ${count}` : productName}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (zoom ? setZoom(null) : zoomIn())}
            aria-label={zoom ? "Zoom out" : "Zoom in"}
            className={roundButton}
          >
            {zoom ? (
              <ZoomOut aria-hidden className="size-5" />
            ) : (
              <ZoomIn aria-hidden className="size-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onClose(index)}
            aria-label="Close photos"
            className={roundButton}
          >
            <X aria-hidden className="size-6" />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className={cn(
            "flex size-full snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            zoom ? "overflow-hidden" : "overflow-x-auto overscroll-x-contain",
          )}
        >
          {images.map((image, i) => {
            const zoomed = zoom !== null && i === index;
            return (
              <div
                key={image._key}
                ref={(el) => {
                  stageRefs.current[i] = el;
                }}
                onPointerMove={zoomed ? onStagePointerMove : undefined}
                aria-hidden={i !== index || undefined}
                className={cn(
                  "flex size-full shrink-0 snap-center snap-always",
                  zoomed
                    ? "[scrollbar-width:none] items-center-safe justify-center-safe overflow-auto overscroll-contain [&::-webkit-scrollbar]:hidden"
                    : "items-center justify-center p-2 sm:p-6",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- sized via the Sanity CDN (static export). */}
                <img
                  src={imageUrl(image, 1400) ?? undefined}
                  srcSet={imageSrcSet(image, VIEWER_WIDTHS)}
                  sizes={zoomed ? `${Math.round(zoom.width)}px` : "100vw"}
                  alt={altFor(i)}
                  loading={Math.abs(i - startIndex) <= 1 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                  onClick={onImageClick}
                  style={zoomed ? { width: zoom.width } : undefined}
                  className={cn(
                    "rounded-lg bg-white select-none",
                    zoomed
                      ? "h-auto max-w-none shrink-0 cursor-zoom-out"
                      : "max-h-full max-w-full cursor-zoom-in object-contain",
                  )}
                />
              </div>
            );
          })}
        </div>

        {count > 1 && !zoom && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous photo"
              className={cn(
                roundButton,
                "absolute top-1/2 left-3 -translate-y-1/2 bg-ink/60",
              )}
            >
              <ChevronLeft aria-hidden className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next photo"
              className={cn(
                roundButton,
                "absolute top-1/2 right-3 -translate-y-1/2 bg-ink/60",
              )}
            >
              <ChevronRight aria-hidden className="size-6" />
            </button>
          </>
        )}
      </div>

      <p className="px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center text-sm text-muted-light">
        {zoom
          ? "Drag to look around · tap to zoom out"
          : "Tap the photo to zoom"}
      </p>
    </m.div>,
    document.body,
  );
}
