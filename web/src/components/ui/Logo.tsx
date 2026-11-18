import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** "dark" text for light backgrounds, "light" text for the navy footer. */
  tone?: "dark" | "light";
  className?: string;
};

/**
 * Placeholder text wordmark: "tabletennis" + a red "68" with an orange ball.
 * To use a real logo later, replace the inner spans with an <img>; callers stay the same.
 */
export function Logo({ tone = "dark", className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="tabletennis68 home"
      className={cn(
        "inline-flex items-baseline rounded-md pr-2 font-display text-2xl leading-none font-extrabold tracking-tight lowercase sm:text-[1.875rem]",
        tone === "dark" ? "text-ink" : "text-surface",
        className,
      )}
    >
      <span aria-hidden>tabletennis</span>
      <span aria-hidden className="relative text-rubber">
        68
        <span className="absolute top-0 -right-2 size-1.5 rounded-full bg-ball sm:size-2" />
      </span>
    </Link>
  );
}
