"use client";

import { useId } from "react";
import type { ProductOption } from "@/lib/types";
import { cn } from "@/lib/utils";

type OptionSelectorProps = {
  option: ProductOption;
  value: string | undefined;
  onChange: (value: string) => void;
  /** Highlight the hint, e.g. after the customer tried to order without choosing. */
  attention?: boolean;
};

/**
 * One product option (e.g. Handle: FL / ST / AN) as pill buttons.
 * Native radio inputs underneath, so arrow keys and screen readers work as a radio group.
 */
export function OptionSelector({
  option,
  value,
  onChange,
  attention = false,
}: OptionSelectorProps) {
  const groupName = useId();

  return (
    <fieldset data-option={option._key} className="min-w-0">
      <legend className="mb-2.5 flex w-full items-baseline gap-2 text-sm">
        <span className="font-medium text-ink">{option.name}</span>
        {value ? (
          <span className="text-muted">{value}</span>
        ) : (
          <span
            className={cn(
              "transition-colors",
              attention ? "font-medium text-crimson" : "text-muted",
            )}
          >
            Select {option.name.toLowerCase()}
          </span>
        )}
      </legend>
      <div className="flex flex-wrap gap-2">
        {option.values.map((optionValue) => (
          <label
            key={optionValue}
            className={cn(
              "relative inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-pill border-2 px-4 text-sm font-medium transition-colors select-none",
              "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-red",
              value === optionValue
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-ink hover:border-ink/40",
            )}
          >
            <input
              type="radio"
              name={groupName}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
              className="sr-only"
            />
            {optionValue}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
