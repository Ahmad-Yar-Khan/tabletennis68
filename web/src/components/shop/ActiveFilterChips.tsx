"use client";

import { X } from "lucide-react";
import type { ShopState } from "@/lib/shop";
import { formatPrice } from "@/lib/utils";
import type { Facets } from "./FilterPanel";

type ActiveFilterChipsProps = {
  state: ShopState;
  facets: Facets;
  onChange: (patch: Partial<ShopState>) => void;
  onClearAll: () => void;
};

type Chip = { key: string; label: string; remove: Partial<ShopState> };

function priceLabel(min: number | null, max: number | null): string {
  if (min !== null && max !== null)
    return `${formatPrice(min)} – ${formatPrice(max)}`;
  if (min !== null) return `${formatPrice(min)}+`;
  return `Up to ${formatPrice(max ?? 0)}`;
}

/** One removable chip per active filter (and the search), plus "Clear all". */
export function ActiveFilterChips({
  state,
  facets,
  onChange,
  onClearAll,
}: ActiveFilterChipsProps) {
  const nameOf = (options: Facets["categories"], slug: string) =>
    options.find((o) => o.slug === slug)?.name ?? slug;

  const chips: Chip[] = [
    ...(state.q
      ? [{ key: "q", label: `“${state.q}”`, remove: { q: "" } }]
      : []),
    ...state.categories.map((slug) => ({
      key: `c-${slug}`,
      label: nameOf(facets.categories, slug),
      remove: { categories: state.categories.filter((s) => s !== slug) },
    })),
    ...state.brands.map((slug) => ({
      key: `b-${slug}`,
      label: nameOf(facets.brands, slug),
      remove: { brands: state.brands.filter((s) => s !== slug) },
    })),
    ...(state.min !== null || state.max !== null
      ? [
          {
            key: "price",
            label: priceLabel(state.min, state.max),
            remove: { min: null, max: null },
          },
        ]
      : []),
    ...(state.inStockOnly
      ? [{ key: "stock", label: "In stock", remove: { inStockOnly: false } }]
      : []),
  ];

  if (chips.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <ul className="contents">
        {chips.map((chip) => (
          <li key={chip.key}>
            <button
              type="button"
              onClick={() => onChange(chip.remove)}
              className="group inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-pill bg-blush pr-2 pl-3.5 text-sm font-medium text-crimson transition-colors hover:bg-crimson hover:text-white"
            >
              <span className="truncate">{chip.label}</span>
              <X aria-hidden className="size-4 shrink-0" />
              <span className="sr-only">(remove filter)</span>
            </button>
          </li>
        ))}
      </ul>
      {chips.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex min-h-9 items-center rounded-md px-2 text-sm font-medium text-ink underline underline-offset-4 transition-colors hover:text-crimson"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
