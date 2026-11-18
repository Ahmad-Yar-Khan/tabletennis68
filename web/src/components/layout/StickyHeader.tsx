"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Sticky <header> that sets `data-scrolled="true"` once the page scrolls.
 * At the top it is white with ink text; scrolled, an ink layer fades in (opacity only, so the
 * header never changes height and nothing below it jumps) and the colours flip via CSS variables:
 *   --hdr-fg      text colour (children inherit it)
 *   --hdr-accent  hover / current-page colour
 *   --logo-accent the "68" in <Logo />
 *   --logo-ball   the ball dot in <Logo />
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
      className="group sticky top-0 z-40 border-b border-line bg-white text-(--hdr-fg) transition-colors duration-300 [--hdr-accent:var(--color-crimson)] [--hdr-fg:var(--color-ink)] data-[scrolled=true]:[--hdr-accent:var(--color-coral)] data-[scrolled=true]:[--hdr-fg:var(--color-white)] data-[scrolled=true]:[--logo-accent:var(--color-coral)] data-[scrolled=true]:[--logo-ball:var(--color-white)]"
    >
      {/* Ink layer + shadow fade in on scroll (opacity only). Covers the light border too. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -bottom-px bg-ink opacity-0 shadow-header transition-opacity duration-300 group-data-[scrolled=true]:opacity-100"
      />
      {children}
    </header>
  );
}
