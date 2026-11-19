"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  parseShopState,
  serializeShopState,
  type LockedFilter,
  type ShopState,
} from "@/lib/shop";

type UpdateOptions = {
  /** Replace the current history entry instead of adding one (e.g. while typing). */
  replace?: boolean;
};

export type ShopStateUpdate =
  Partial<ShopState> | ((current: ShopState) => ShopState);

/**
 * Shop filter state stored in the URL query string.
 * Writes use the native History API, which Next.js syncs into `useSearchParams` without a
 * server round-trip, so links are shareable and Back/Forward step through filter changes.
 * Must be rendered inside <Suspense> (static export requirement for useSearchParams).
 */
export function useShopUrlState(locked?: LockedFilter) {
  const searchParams = useSearchParams();
  const lockedType = locked?.type;
  const lockedSlug = locked?.slug;

  const state = useMemo(
    () =>
      parseShopState(
        searchParams,
        lockedType && lockedSlug
          ? { type: lockedType, slug: lockedSlug }
          : undefined,
      ),
    [searchParams, lockedType, lockedSlug],
  );

  /** Reads the *current* URL at call time, so debounced callers never apply stale state. */
  const update = useCallback(
    (change: ShopStateUpdate, { replace = false }: UpdateOptions = {}) => {
      const current = parseShopState(
        new URLSearchParams(window.location.search),
        lockedType && lockedSlug
          ? { type: lockedType, slug: lockedSlug }
          : undefined,
      );
      const next =
        typeof change === "function"
          ? change(current)
          : { ...current, ...change };
      const query = serializeShopState(next);
      if (query === serializeShopState(current)) return;

      const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
      if (replace) window.history.replaceState(null, "", url);
      else window.history.pushState(null, "", url);
    },
    [lockedType, lockedSlug],
  );

  return [state, update] as const;
}
