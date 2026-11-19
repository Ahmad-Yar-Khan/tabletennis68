import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  /** Adds a "View all" link on the right. */
  href?: string;
  linkLabel?: string;
  as?: "h1" | "h2" | "h3";
  /** Put on the heading, so a section can use `aria-labelledby`. */
  id?: string;
  className?: string;
};

/** Section title with an optional subtitle and "View all" link. */
export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = "View all",
  as: Tag = "h2",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <Tag id={id} className="flex items-center gap-3 text-3xl uppercase sm:text-4xl">
          {/* Slanted red "table line" accent */}
          <span
            aria-hidden
            className="inline-block h-[0.8em] w-1.5 shrink-0 -skew-x-12 rounded-[1px] bg-red"
          />
          {title}
        </Tag>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md text-sm font-medium text-crimson transition-colors hover:text-ink"
        >
          {linkLabel}
          <span className="sr-only">: {title}</span>
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </div>
  );
}
