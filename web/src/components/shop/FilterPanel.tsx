"use client";

import type { FacetOption, LockedFilter, ShopState } from "@/lib/shop";
import { FacetFilter } from "./FacetFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { StockToggle } from "./StockToggle";

export type Facets = { categories: FacetOption[]; brands: FacetOption[] };

type FilterPanelProps = {
  state: ShopState;
  onChange: (patch: Partial<ShopState>) => void;
  facets: Facets;
  /** The page's fixed filter; its group is hidden. */
  locked?: LockedFilter;
  className?: string;
};

/**
 * All filter controls. Used live in the desktop sidebar and on a draft copy in the mobile drawer,
 * so it only reports changes and never touches the URL itself.
 */
export function FilterPanel({
  state,
  onChange,
  facets,
  locked,
  className,
}: FilterPanelProps) {
  return (
    <div className={className}>
      {locked?.type !== "category" && (
        <FacetFilter
          legend="Category"
          options={facets.categories}
          selected={state.categories}
          onChange={(categories) => onChange({ categories })}
        />
      )}
      {locked?.type !== "brand" && (
        <FacetFilter
          legend="Brand"
          options={facets.brands}
          selected={state.brands}
          onChange={(brands) => onChange({ brands })}
        />
      )}
      <PriceRangeFilter min={state.min} max={state.max} onChange={onChange} />
      <StockToggle
        checked={state.inStockOnly}
        onChange={(inStockOnly) => onChange({ inStockOnly })}
      />
    </div>
  );
}
