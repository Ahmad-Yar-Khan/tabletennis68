"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function focusableIn(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("inert") && el.getClientRects().length > 0,
  );
}

type FocusTrapOptions = {
  /** Called when Escape is pressed while the trap is active. */
  onEscape?: () => void;
  /** Element to focus first. Defaults to the first focusable element, then the container. */
  initialFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * While `active`: keeps Tab / Shift+Tab inside `containerRef`, handles Escape,
 * and on deactivation returns focus to whatever was focused before (e.g. the menu button).
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  { onEscape, initialFocusRef }: FocusTrapOptions = {},
): void {
  const handleEscape = useEffectEvent(() => onEscape?.());
  const getInitialTarget = useEffectEvent(() => initialFocusRef?.current);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const target = getInitialTarget() ?? focusableIn(container)[0] ?? container;
    target.focus({ preventScroll: true });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        handleEscape();
        return;
      }
      if (event.key !== "Tab" || !container) return;

      const items = focusableIn(container);
      if (items.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      if (
        event.shiftKey &&
        (current === first || !container.contains(current))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (current === last || !container.contains(current))
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [active, containerRef]);
}
