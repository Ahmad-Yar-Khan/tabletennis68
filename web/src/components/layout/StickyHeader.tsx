"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Sticky <header> that sets `data-scrolled="true"` once the page scrolls.
 * Children style themselves with `group-data-[scrolled=true]:…` (transform/opacity only,
 * so the header never changes height and nothing below it jumps).
 */
export function StickyHeader({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      el.dataset.scrolled = String(window.scrollY > 8);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      ref={ref}
      data-scrolled="false"
      className="group sticky top-0 z-40 border-b border-line bg-surface"
    >
      {/* Shadow fades in on scroll (opacity only). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 shadow-header transition-opacity duration-300 group-data-[scrolled=true]:opacity-100"
      />
      {children}
    </header>
  );
}
