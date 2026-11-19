import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

type Crumb = { href: string; label: string };

type ListingHeroProps = {
  title: string;
  eyebrow?: string;
  description?: string | null;
  /** Small line under the title, e.g. "24 products". */
  meta?: string;
  /** Links before the current page, e.g. [{ href: "/shop/", label: "Shop" }]. */
  breadcrumbs?: Crumb[];
  /** Extra content: below the text on phones, on the right from sm up (e.g. a brand logo). */
  aside?: ReactNode;
};

/** Dark title band for listing pages (/shop, categories, brands), with a slanted bottom edge. */
export function ListingHero({
  title,
  eyebrow,
  description,
  meta,
  breadcrumbs = [],
  aside,
}: ListingHeroProps) {
  return (
    <div className="relative overflow-hidden bg-ink pt-6 pb-12 text-white [--slant:1.5rem] slant-bottom sm:pt-8 sm:pb-16 sm:[--slant:2.5rem]">
      {/* Faint "table lines": centre line and side line. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/[0.06]" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.06]" />
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-red/20 blur-3xl" />
      </div>
      <Container className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0">
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-3 text-sm">
              <ol className="flex flex-wrap items-center gap-1.5 text-muted-light">
                <li>
                  <Link href="/" className="transition-colors hover:text-white">
                    Home
                  </Link>
                </li>
                {breadcrumbs.map((crumb) => (
                  <li key={crumb.href} className="flex items-center gap-1.5">
                    <span aria-hidden>›</span>
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-white"
                    >
                      {crumb.label}
                    </Link>
                  </li>
                ))}
                <li className="flex items-center gap-1.5">
                  <span aria-hidden>›</span>
                  <span aria-current="page" className="text-white">
                    {title}
                  </span>
                </li>
              </ol>
            </nav>
          )}
          {eyebrow && (
            <p className="mb-1 text-sm font-medium tracking-widest text-coral uppercase">
              {eyebrow}
            </p>
          )}
          <h1 className="text-5xl uppercase sm:text-6xl">{title}</h1>
          {description && (
            <p className="mt-3 max-w-prose-narrow text-muted-light sm:text-lg">
              {description}
            </p>
          )}
          {meta && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-white/90 tabular-nums">
              <span aria-hidden className="h-0.5 w-6 bg-coral" />
              {meta}
            </p>
          )}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </Container>
    </div>
  );
}
