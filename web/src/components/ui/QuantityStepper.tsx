"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  /** Accessible name, e.g. "Quantity for Butterfly Viscaria". */
  label?: string;
  className?: string;
};

/** − value + control for quantities. Controlled: the parent owns the number. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  label = "Quantity",
  className,
}: QuantityStepperProps) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));
  const btn = cn(
    "inline-flex items-center justify-center rounded-full text-ink transition-colors hover:bg-blush hover:text-crimson disabled:pointer-events-none disabled:opacity-35",
    size === "sm" ? "size-9" : "size-11",
  );

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center rounded-pill border-2 border-line bg-white",
        className,
      )}
    >
      <button
        type="button"
        className={btn}
        onClick={() => set(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus aria-hidden className="size-4" />
      </button>
      <output
        aria-live="polite"
        className={cn(
          "text-center font-medium tabular-nums",
          size === "sm" ? "w-7 text-sm" : "w-9",
        )}
      >
        {value}
      </output>
      <button
        type="button"
        className={btn}
        onClick={() => set(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus aria-hidden className="size-4" />
      </button>
    </div>
  );
}
