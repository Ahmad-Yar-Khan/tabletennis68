"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import type { FacetOption } from "@/lib/shop";
import { cn } from "@/lib/utils";
import { FilterGroup } from "./FilterGroup";

type FacetFilterProps = {
  legend: string;
  options: FacetOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  /** Show this many options until "Show all" is pressed. */
  initialVisible?: number;
};

/** Multi-select checkbox list (categories, brands) with product counts. */
export function FacetFilter({
  legend,
  options,
  selected,
  onChange,
  initialVisible = 6,
}: FacetFilterProps) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  if (options.length === 0) return null;

  const selectedSet = new Set(selected);
  const collapsible = options.length > initialVisible + 1;
  // Selected options always stay visible, even when the list is collapsed.
  const visible =
    collapsible && !expanded
      ? options.filter((o, i) => i < initialVisible || selectedSet.has(o.slug))
      : options;

  const toggle = (slug: string) =>
    onChange(
      selectedSet.has(slug)
        ? selected.filter((s) => s !== slug)
        : [...selected, slug],
    );

  return (
    <FilterGroup legend={legend}>
      <ul className="space-y-0.5">
        {visible.map((option) => {
          const inputId = `${id}-${option.slug}`;
          return (
            <li key={option.slug}>
              <label
                htmlFor={inputId}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 transition-colors hover:bg-blush/60 lg:min-h-10"
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={selectedSet.has(option.slug)}
                  onChange={() => toggle(option.slug)}
                  className="size-5 shrink-0 cursor-pointer accent-red"
                />
                <span className="min-w-0 flex-1 truncate">{option.name}</span>
                <span className="text-sm text-muted tabular-nums">
                  {option.count}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="mt-1 inline-flex min-h-10 items-center gap-1 rounded-md px-2 text-sm font-medium text-crimson transition-colors hover:text-ink"
        >
          {expanded ? "Show fewer" : `Show all ${options.length}`}
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>
      )}
    </FilterGroup>
  );
}
