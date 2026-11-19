import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** "dark" text for light backgrounds, "light" text for dark ones (footer). */
  tone?: "dark" | "light";
  className?: string;
};

/**
 * Placeholder text wordmark: italic "tabletennis" + an accent "68" with a ball dot.
 * On light backgrounds: red 68, coral ball. On dark: coral 68, white ball.
 * A parent can override these with the `--logo-accent` / `--logo-ball` CSS variables
 * (the header does this when it turns dark on scroll).
 * To use a real logo later, replace the inner spans with an <img>; callers stay the same.
 */
export function Logo({ tone = "dark", className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="tabletennis68 home"
      className={cn(
        "inline-flex min-h-11 items-center rounded-md pr-2 font-display text-2xl leading-none font-extrabold tracking-tight lowercase italic sm:text-[1.875rem]",
        tone === "dark" ? "text-ink" : "text-white",
        className,
      )}
    >
      <span aria-hidden>tabletennis</span>
      <span
        aria-hidden
        className={cn(
          "relative",
          tone === "dark"
            ? "text-(--logo-accent,var(--color-red))"
            : "text-(--logo-accent,var(--color-coral))",
        )}
      >
        68
        <span
          className={cn(
            "absolute top-0 -right-2 size-1.5 rounded-full sm:size-2",
            tone === "dark"
              ? "bg-(--logo-ball,var(--color-coral))"
              : "bg-(--logo-ball,var(--color-white))",
          )}
        />
      </span>
    </Link>
  );
}
