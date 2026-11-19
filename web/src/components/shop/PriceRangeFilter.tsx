"use client";

import { useCallback, useId } from "react";
import { useDebouncedInput } from "@/lib/hooks/useDebouncedInput";
import { PRICE_RANGES } from "@/lib/shop";
import { cn } from "@/lib/utils";
import { FilterGroup } from "./FilterGroup";

type PriceRangeFilterProps = {
  min: number | null;
  max: number | null;
  onChange: (patch: { min?: number | null; max?: number | null }) => void;
};

const digitsOnly = (value: string) => value.replace(/\D/g, "");
const toPrice = (value: string) => (value ? Number(value) || null : null);

/** Quick price ranges plus free min/max inputs (in Rs). */
export function PriceRangeFilter({
  min,
  max,
  onChange,
}: PriceRangeFilterProps) {
  return (
    <FilterGroup legend="Price">
      <div className="flex flex-wrap gap-2">
        {PRICE_RANGES.map((range) => {
          const active = range.min === min && range.max === max;
          return (
            <button
              key={range.id}
              type="button"
              aria-pressed={active}
              onClick={() =>
                onChange(
                  active
                    ? { min: null, max: null }
                    : { min: range.min, max: range.max },
                )
              }
              className={cn(
                "inline-flex min-h-10 items-center rounded-pill border-2 px-3.5 text-sm font-medium transition-colors",
                active
                  ? "border-red bg-red text-white"
                  : "border-line bg-white text-ink hover:border-ink",
              )}
            >
              {range.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <PriceInput
          label="Min"
          value={min}
          onCommit={(v) => onChange({ min: v })}
        />
        <span aria-hidden className="text-muted">
          –
        </span>
        <PriceInput
          label="Max"
          value={max}
          onCommit={(v) => onChange({ max: v })}
        />
      </div>
    </FilterGroup>
  );
}

function PriceInput({
  label,
  value: external,
  onCommit,
}: {
  label: string;
  value: number | null;
  onCommit: (value: number | null) => void;
}) {
  const id = useId();
  const commit = useCallback((v: string) => onCommit(toPrice(v)), [onCommit]);
  const { value, onChange, flush } = useDebouncedInput(
    external === null ? "" : String(external),
    commit,
    { delay: 600, normalise: digitsOnly },
  );

  return (
    <div className="relative min-w-0 flex-1">
      <label htmlFor={id} className="sr-only">
        {label} price in rupees
      </label>
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted"
      >
        Rs
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        placeholder={label}
        value={value}
        onChange={(e) => onChange(digitsOnly(e.target.value))}
        onBlur={(e) => flush(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            flush(e.currentTarget.value);
          }
        }}
        className="h-11 w-full rounded-pill border-2 border-line bg-white pr-3 pl-9 text-base tabular-nums outline-none placeholder:text-muted focus:border-red"
      />
    </div>
  );
}
