import { cn } from "@/lib/utils";

type BadgeProps = { className?: string } & (
  | {
      variant: "sale";
      /** Whole-number % off, e.g. 20 → "-20%". Omit to show "Sale". */
      percent?: number;
    }
  | { variant: "new" | "out-of-stock"; percent?: never }
);

const styles = {
  sale: "bg-rubber text-surface",
  new: "bg-ball text-ink",
  "out-of-stock": "bg-ink-700 text-surface",
} as const;

/** Small product label: Sale (with % off), New, or Out of stock. */
export function Badge({ variant, percent, className }: BadgeProps) {
  const base = cn(
    "inline-flex items-center rounded-pill px-2.5 py-1 font-display text-xs leading-none font-bold tracking-wide uppercase",
    styles[variant],
    className,
  );

  if (variant === "sale" && percent) {
    return (
      <span className={base}>
        <span className="sr-only">Sale, {percent}% off</span>
        <span aria-hidden>-{percent}%</span>
      </span>
    );
  }

  return (
    <span className={base}>
      {variant === "sale" ? "Sale" : variant === "new" ? "New" : "Out of stock"}
    </span>
  );
}
