"use client";

import { useId } from "react";
import { SORT_OPTIONS, type SortKey } from "@/lib/shop";
import { cn } from "@/lib/utils";
import { FilterGroup } from "./FilterGroup";

type SortOptionsProps = {
  value: SortKey;
  onChange: (sort: SortKey) => void;
};

/** Sort order as large radio pills (mobile filter drawer). */
export function SortOptions({ value, onChange }: SortOptionsProps) {
  const name = useId();

  return (
    <FilterGroup legend="Sort by">
      <div className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((o) => (
          <label
            key={o.value}
            className={cn(
              "inline-flex min-h-10 cursor-pointer items-center rounded-pill border-2 px-3.5 text-sm font-medium transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-red",
              value === o.value
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-ink hover:border-ink",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </FilterGroup>
  );
}
