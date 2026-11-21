"use client";

import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type LazyMapEmbedProps = {
  /** Google Maps embed URL (https://www.google.com/maps/embed?...). */
  src: string;
  title: string;
  className?: string;
};

/**
 * Google Map that only loads when it scrolls near the screen (the embed is ~1 MB of
 * scripts, too heavy for mobile data on first load). Until then a light placeholder shows,
 * with a button to load it straight away.
 */
export function LazyMapEmbed({ src, title, className }: LazyMapEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    // Very old browsers: the "Show map" button still works.
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative isolate overflow-hidden rounded-card border border-line bg-paper",
        className,
      )}
    >
      {/* Placeholder: faint table lines + pin. Fades out once the map has loaded. */}
      <div
        aria-hidden={inView}
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center transition-opacity duration-500",
          loaded && "pointer-events-none opacity-0",
        )}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-y-0 left-1/2 w-px bg-line" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
          <div className="absolute inset-4 rounded-xl border border-line" />
        </div>
        <span className="relative inline-flex size-14 items-center justify-center rounded-full bg-blush text-crimson">
          <MapPin aria-hidden className="size-7" />
        </span>
        {inView ? (
          <p className="relative text-sm text-muted">Loading map…</p>
        ) : (
          <button
            type="button"
            onClick={() => setInView(true)}
            className="relative inline-flex h-11 items-center rounded-pill border-2 border-ink/15 bg-white px-5 font-medium transition-colors hover:border-ink"
          >
            Show map
          </button>
        )}
      </div>

      {inView && (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          className={cn(
            "absolute inset-0 size-full border-0 transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}
