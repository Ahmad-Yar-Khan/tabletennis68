"use client";

import { useMemo, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import {
  clearedState,
  countMatches,
  hasActiveFilters,
  type IndexedProduct,
  type LockedFilter,
  type ShopState,
} from "@/lib/shop";
import { FilterPanel, type Facets } from "./FilterPanel";
import { SortOptions } from "./SortOptions";

type FilterDrawerProps = {
  /** Draft being edited; null when closed. Changes apply only on "Show N results". */
  draft: ShopState | null;
  setDraft: Dispatch<SetStateAction<ShopState | null>>;
  onApply: (state: ShopState) => void;
  onClose: () => void;
  index: IndexedProduct[];
  facets: Facets;
  locked?: LockedFilter;
};

/** Mobile "Filter & sort" bottom sheet. Edits a draft so the grid behind it doesn't re-render on every tap. */
export function FilterDrawer({
  draft,
  setDraft,
  onApply,
  onClose,
  index,
  facets,
  locked,
}: FilterDrawerProps) {
  const count = useMemo(
    () => (draft ? countMatches(index, draft) : 0),
    [index, draft],
  );

  return (
    <Drawer
      open={draft !== null}
      onClose={onClose}
      title="Filter & sort"
      side="bottom"
      footer={
        draft && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              disabled={!hasActiveFilters(draft)}
              onClick={() => setDraft((d) => d && clearedState(d))}
            >
              Clear all
            </Button>
            <Button fullWidth className="flex-1" onClick={() => onApply(draft)}>
              {count === 0
                ? "No results"
                : `Show ${count} ${count === 1 ? "result" : "results"}`}
            </Button>
          </div>
        )
      }
    >
      {draft && (
        <div className="px-4 pt-4 pb-6">
          <SortOptions
            value={draft.sort}
            onChange={(sort) => setDraft((d) => d && { ...d, sort })}
          />
          <FilterPanel
            state={draft}
            onChange={(patch) => setDraft((d) => d && { ...d, ...patch })}
            className="border-t border-line pt-5"
            facets={facets}
            locked={locked}
          />
        </div>
      )}
    </Drawer>
  );
}
