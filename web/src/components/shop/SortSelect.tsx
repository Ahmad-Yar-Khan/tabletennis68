"use client";

import { ChevronDown } from "lucide-react";
import { useId } from "react";
import { SORT_OPTIONS, type SortKey } from "@/lib/shop";
import { cn } from "@/lib/utils";

type SortSelectProps = {
  value: SortKey;
  onChange: (sort: SortKey) => void;
  className?: string;
};

/** "Sort by" dropdown (desktop toolbar). Native <select> for the best keyboard/screen-reader support. */
export function SortSelect({ value, onChange, className }: SortSelectProps) {
  const id = useId();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor={id} className="text-sm whitespace-nowrap text-muted">
        Sort by
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as SortKey)}
          className="h-11 cursor-pointer appearance-none rounded-pill border-2 border-line bg-white pr-10 pl-4 font-medium outline-none hover:border-ink focus:border-red"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2"
        />
      </div>
    </div>
  );
}
