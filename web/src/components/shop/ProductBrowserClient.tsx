"use client";

import { SlidersHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useHasOpened } from "@/lib/hooks/useHasOpened";
import { useShopUrlState } from "@/lib/hooks/useShopUrlState";
import {
  clearedState,
  countActiveFilters,
  filterProducts,
  indexProducts,
  PAGE_SIZE,
  productCountLabel,
  type LockedFilter,
  type ShopState,
} from "@/lib/shop";
import type { ProductListItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ActiveFilterChips } from "./ActiveFilterChips";
import { EmptyResults } from "./EmptyResults";
import { FilterPanel, type Facets } from "./FilterPanel";
import { ShopSearchField } from "./ShopSearchField";
import { ShowMore } from "./ShowMore";
import { SortSelect } from "./SortSelect";

// Mobile-only bottom sheet (and Motion, which animates it): downloaded when first opened.
const loadFilterDrawer = () => import("./FilterDrawer");
const FilterDrawer = dynamic(
  () => loadFilterDrawer().then((mod) => mod.FilterDrawer),
  { ssr: false },
);
const preloadFilterDrawer = () => void loadFilterDrawer();

export type ProductBrowserClientProps = {
  products: ProductListItem[];
  facets: Facets;
  locked?: LockedFilter;
  whatsappNumber: string | null;
  searchPlaceholder?: string;
};

/** Only re-renders when the filtered list itself changes (not on drawer toggles, typing, etc.). */
const ResultsGrid = memo(ProductGrid);

/** Grid columns with the sidebar beside it: 2 on phones, 3 from tablets up. */
const GRID_CLASS = "md:grid-cols-3 lg:grid-cols-3 lg:gap-5 xl:gap-6";

export function ProductBrowserClient({
  products,
  facets,
  locked,
  whatsappNumber,
  searchPlaceholder,
}: ProductBrowserClientProps) {
  const [state, update] = useShopUrlState(locked);
  const [draft, setDraft] = useState<ShopState | null>(null);
  const drawerMounted = useHasOpened(draft !== null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Built once per product list: lower-cased search text, effective price, etc.
  const index = useMemo(() => indexProducts(products), [products]);
  // Filtering runs at low priority, so inputs and chips stay responsive.
  const deferredState = useDeferredValue(state);
  const results = useMemo(
    () => filterProducts(index, deferredState),
    [index, deferredState],
  );
  const activeCount = countActiveFilters(state);

  // "Show more": only the first `page × 24` results are rendered.
  const visibleCount = Math.min(deferredState.page * PAGE_SIZE, results.length);
  const visible = useMemo(
    () => results.slice(0, visibleCount),
    [results, visibleCount],
  );

  // After "Show more", move keyboard focus to the first new card (not the top of the list).
  const gridRef = useRef<HTMLDivElement>(null);
  const focusFrom = useRef<number | null>(null);
  useEffect(() => {
    const from = focusFrom.current;
    if (from === null || visibleCount <= from) return;
    focusFrom.current = null;
    gridRef.current
      ?.querySelectorAll<HTMLAnchorElement>("li > a")
      [from]?.focus({ preventScroll: true });
  }, [visibleCount]);

  const showMore = useCallback(() => {
    focusFrom.current = visibleCount;
    // Replace, not push: Back should leave the shop, not un-load 24 products at a time.
    update({ page: Math.ceil(visibleCount / PAGE_SIZE) + 1 }, { replace: true });
  }, [update, visibleCount]);

  /** After a bulk change, bring the top of the results back into view if it scrolled away. */
  const revealResults = useCallback(() => {
    const el = resultsRef.current;
    if (el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ block: "start" });
    }
  }, []);

  const patch = useCallback(
    (change: Partial<ShopState>) => update(change),
    [update],
  );

  const clearAll = useCallback(() => {
    update(clearedState);
    revealResults();
  }, [update, revealResults]);

  const commitSearch = useCallback(
    (q: string) => {
      // First search adds a history entry; refining it replaces that entry (no Back-button spam).
      const hadQuery = new URLSearchParams(window.location.search).has("q");
      update({ q }, { replace: hadQuery && q !== "" });
    },
    [update],
  );

  const applyDraft = useCallback(
    (next: ShopState) => {
      update(next);
      setDraft(null);
      revealResults();
    },
    [update, revealResults],
  );

  const closeDrawer = useCallback(() => setDraft(null), []);

  return (
    <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[16rem_minmax(0,1fr)] xl:gap-10">
      {/* Desktop sidebar: filters apply immediately. */}
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain pr-2 pb-6">
          <FilterPanel
            state={state}
            onChange={patch}
            facets={facets}
            locked={locked}
          />
        </div>
      </aside>

      <div ref={resultsRef} className="min-w-0">
        <ShopSearchField
          value={state.q}
          onCommit={commitSearch}
          placeholder={searchPlaceholder}
        />

        {/* Mobile: sticky under the header. Desktop: plain toolbar row. */}
        <div className="sticky top-16 z-20 -mx-4 mt-3 flex min-h-16 items-center justify-between gap-3 border-b border-line bg-paper/95 px-4 py-2 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mt-4 lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={draft !== null}
            onPointerDown={preloadFilterDrawer}
            onFocus={preloadFilterDrawer}
            onClick={() => setDraft(state)}
            className="inline-flex h-11 items-center gap-2 rounded-pill bg-ink px-5 font-medium text-white transition-colors hover:bg-oxblood active:scale-[0.98] lg:hidden"
          >
            <SlidersHorizontal aria-hidden className="size-5" />
            Filter &amp; sort
            {activeCount > 0 && (
              <span className="inline-flex min-w-6 items-center justify-center rounded-pill bg-red px-1.5 text-sm leading-6 tabular-nums">
                <span className="sr-only">(</span>
                {activeCount}
                <span className="sr-only"> active)</span>
              </span>
            )}
          </button>
          <p
            role="status"
            className="text-sm text-muted tabular-nums lg:text-base"
          >
            <span className="font-medium text-ink">
              {productCountLabel(results.length)}
            </span>
          </p>
          <SortSelect
            value={state.sort}
            onChange={(sort) => update({ sort })}
            className="hidden lg:flex"
          />
        </div>

        <ActiveFilterChips
          state={state}
          facets={facets}
          onChange={patch}
          onClearAll={clearAll}
        />

        <div
          ref={gridRef}
          className={cn(
            "mt-4 transition-opacity duration-150",
            // Dim while a new result set is being prepared in the background.
            state !== deferredState && "opacity-60",
          )}
        >
          {results.length > 0 ? (
            <>
              <ResultsGrid
                products={visible}
                priorityCount={4}
                className={GRID_CLASS}
              />
              <ShowMore
                shown={visibleCount}
                total={results.length}
                onShowMore={showMore}
              />
            </>
          ) : (
            <EmptyResults
              query={deferredState.q}
              whatsappNumber={whatsappNumber}
              onReset={clearAll}
            />
          )}
        </div>
      </div>

      {drawerMounted && (
        <FilterDrawer
          draft={draft}
          setDraft={setDraft}
          onApply={applyDraft}
          onClose={closeDrawer}
          index={index}
          facets={facets}
          locked={locked}
        />
      )}
    </div>
  );
}
