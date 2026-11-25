"use client";

import { ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  countActiveFilters,
  type LockedFilter,
  type ShopState,
} from "@/lib/shop";
import { cn } from "@/lib/utils";
import { FacetFilter } from "./FacetFilter";
import type { Facets } from "./FilterPanel";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { StockToggle } from "./StockToggle";

type FilterMenuProps = {
  state: ShopState;
  onChange: (patch: Partial<ShopState>) => void;
  facets: Facets;
  locked?: LockedFilter;
  className?: string;
};

type SectionId = "category" | "brand" | "price";

/** Grace period so the pointer can cross the small gap between the menu and a flyout. */
const CLOSE_DELAY = 200;

const panelClass =
  "rounded-card border border-line bg-white text-ink shadow-lift";

/**
 * Desktop "Filter by" dropdown in the results toolbar (replaces the old sidebar).
 * Hovering Category / Brand / Price opens a flyout with every option; changes apply immediately.
 * Also works with click, keyboard (Enter / → to open a flyout, Esc to step back) and touch.
 */
export function FilterMenu({
  state,
  onChange,
  facets,
  locked,
  className,
}: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<SectionId | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const menuId = useId();
  const activeCount = countActiveFilters(state);

  const close = useCallback(() => {
    clearTimeout(closeTimer.current);
    setOpen(false);
    setSection(null);
  }, []);

  const cancelClose = () => clearTimeout(closeTimer.current);

  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      // Don't snatch the menu away while someone is typing a min/max price.
      const focused = document.activeElement;
      if (
        focused instanceof HTMLInputElement &&
        focused.type === "text" &&
        wrapperRef.current?.contains(focused)
      )
        return;
      close();
    }, CLOSE_DELAY);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Close on outside click/tap.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  const sections: {
    id: SectionId;
    label: string;
    selected: number;
    render: () => ReactNode;
    wide?: boolean;
  }[] = [];

  if (locked?.type !== "category" && facets.categories.length > 0) {
    sections.push({
      id: "category",
      label: "Category",
      selected: state.categories.length,
      render: () => (
        <FacetFilter
          legend="Category"
          options={facets.categories}
          selected={state.categories}
          onChange={(categories) => onChange({ categories })}
          initialVisible={Infinity}
        />
      ),
    });
  }
  if (locked?.type !== "brand" && facets.brands.length > 0) {
    sections.push({
      id: "brand",
      label: "Brand",
      selected: state.brands.length,
      wide: facets.brands.length > 8,
      render: () => (
        <FacetFilter
          legend="Brand"
          options={facets.brands}
          selected={state.brands}
          onChange={(brands) => onChange({ brands })}
          initialVisible={Infinity}
          columns={facets.brands.length > 8 ? 2 : 1}
        />
      ),
    });
  }
  sections.push({
    id: "price",
    label: "Price",
    selected: state.min !== null || state.max !== null ? 1 : 0,
    render: () => (
      <PriceRangeFilter min={state.min} max={state.max} onChange={onChange} />
    ),
  });

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", className)}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        cancelClose();
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") scheduleClose();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || !open) return;
        e.stopPropagation();
        if (section) {
          // Step back from the flyout to its row.
          const row = wrapperRef.current?.querySelector<HTMLButtonElement>(
            `[data-section="${section}"]`,
          );
          setSection(null);
          row?.focus();
        } else {
          close();
          buttonRef.current?.focus();
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close();
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => (open ? close() : setOpen(true))}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-pill border-2 bg-white pr-3.5 pl-4 font-medium transition-colors",
          open ? "border-ink" : "border-line hover:border-ink",
        )}
      >
        <SlidersHorizontal aria-hidden className="size-4" />
        Filter by
        {activeCount > 0 && (
          <span className="inline-flex min-w-6 items-center justify-center rounded-pill bg-red px-1.5 text-sm leading-6 text-white tabular-nums">
            <span className="sr-only">(</span>
            {activeCount}
            <span className="sr-only"> active)</span>
          </span>
        )}
        <ChevronDown
          aria-hidden
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        // pt-2 instead of a margin, so the pointer never leaves the wrapper on the way down.
        <div id={menuId} className="absolute top-full left-0 z-40 pt-2">
          <div className={cn(panelClass, "w-60 p-2")}>
            <ul>
              {sections.map((s) => {
                const expanded = section === s.id;
                const flyoutId = `${menuId}-${s.id}`;
                return (
                  <li
                    key={s.id}
                    className="relative"
                    onPointerEnter={(e) => {
                      if (e.pointerType === "mouse") setSection(s.id);
                    }}
                  >
                    <button
                      type="button"
                      data-section={s.id}
                      aria-expanded={expanded}
                      aria-controls={flyoutId}
                      onClick={() => setSection(expanded ? null : s.id)}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowRight") {
                          e.preventDefault();
                          setSection(s.id);
                          // Move into the flyout once it has rendered.
                          requestAnimationFrame(() =>
                            document
                              .getElementById(flyoutId)
                              ?.querySelector<HTMLElement>("input, button")
                              ?.focus(),
                          );
                        }
                      }}
                      className={cn(
                        "flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left font-medium transition-colors",
                        expanded
                          ? "bg-blush text-crimson"
                          : "hover:bg-paper hover:text-crimson",
                      )}
                    >
                      <span className="flex-1">{s.label}</span>
                      {s.selected > 0 && (
                        <span className="inline-flex min-w-6 items-center justify-center rounded-pill bg-red px-1.5 text-xs leading-5 text-white tabular-nums">
                          {s.selected}
                          <span className="sr-only"> selected</span>
                        </span>
                      )}
                      <ChevronRight aria-hidden className="size-4" />
                    </button>

                    {expanded && (
                      // pl-3 bridges the gap to the flyout (same trick as above).
                      <div
                        id={flyoutId}
                        className="absolute top-0 left-full z-10 -mt-2 pl-3"
                      >
                        <div
                          className={cn(
                            panelClass,
                            "max-h-[70dvh] overflow-y-auto overscroll-contain p-4",
                            s.wide ? "w-[28rem]" : "w-72",
                          )}
                        >
                          {s.render()}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
              <li
                className="mt-1 border-t border-line px-3 pt-1"
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setSection(null);
                }}
              >
                <StockToggle
                  checked={state.inStockOnly}
                  onChange={(inStockOnly) => onChange({ inStockOnly })}
                  className="border-t-0 pt-0"
                  labelClassName="font-sans text-base font-medium normal-case not-italic tracking-normal"
                />
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
