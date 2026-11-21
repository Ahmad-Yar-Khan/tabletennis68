"use client";

import { useEffect } from "react";

/** Locks page scrolling while `active` (for modals), without the layout jumping when the scrollbar disappears. */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const { body, documentElement } = document;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const prev = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
    };
  }, [active]);
}
