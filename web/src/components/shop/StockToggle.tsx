"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type StockToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** "In stock only" switch. */
export function StockToggle({ checked, onChange }: StockToggleProps) {
  const labelId = useId();

  return (
    <div className="flex min-h-11 items-center justify-between gap-3 border-t border-line pt-5">
      <span
        id={labelId}
        className="font-display text-xl font-bold tracking-wide uppercase italic"
      >
        In stock only
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-pill transition-colors",
          checked ? "bg-red" : "bg-line",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow-card transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}
