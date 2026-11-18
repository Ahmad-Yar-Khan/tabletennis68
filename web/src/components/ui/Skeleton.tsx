import { cn } from "@/lib/utils";

/** Grey pulsing block shown while something loads. Size it with className. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-lg bg-line motion-reduce:animate-none",
        className,
      )}
    />
  );
}
