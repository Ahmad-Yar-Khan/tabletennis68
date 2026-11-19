import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FilterGroupProps = {
  legend: string;
  children: ReactNode;
  className?: string;
};

/** A titled block in the filter panel (fieldset + legend for screen readers). */
export function FilterGroup({ legend, children, className }: FilterGroupProps) {
  return (
    <fieldset
      className={cn(
        "border-t border-line py-5 first:border-t-0 first:pt-0",
        className,
      )}
    >
      <legend className="float-left mb-3 w-full font-display text-xl font-bold tracking-wide uppercase italic">
        {legend}
      </legend>
      <div className="clear-left">{children}</div>
    </fieldset>
  );
}
