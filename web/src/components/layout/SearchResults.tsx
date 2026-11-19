"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { use, useMemo } from "react";
import { PaddleIcon } from "@/components/ui/icons/PaddleIcon";
import { searchTokens } from "@/lib/search";
import { loadSearchIndex, searchIndex } from "@/lib/searchIndex";
import {
  formatPrice,
  getEffectivePrice,
  isOnSale,
  productPath,
} from "@/lib/utils";

const MAX_RESULTS = 6;

type SearchResultsProps = {
  query: string;
  /** Called when a result is chosen (closes the overlay). */
  onNavigate: () => void;
};

/** Instant results for the header search. Suspends until the search index has loaded. */
export function SearchResults({ query, onNavigate }: SearchResultsProps) {
  const items = use(loadSearchIndex());
  const tokens = useMemo(() => searchTokens(query), [query]);
  const matches = useMemo(
    () => (items ? searchIndex(items, tokens) : []),
    [items, tokens],
  );

  const q = query.trim();
  if (!q) {
    return (
      <p className="py-4 text-sm text-muted">
        Type a product or brand, e.g. “Tenergy” or “DHS”.
      </p>
    );
  }

  const shopHref = `/shop/?q=${encodeURIComponent(q)}`;

  // Index unavailable: just offer the full search page.
  if (!items) {
    return (
      <Link href={shopHref} onClick={onNavigate} className={footerLinkClass}>
        Search the shop for “{q}”
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="py-4">
        <p role="status" className="text-muted">
          No products match{" "}
          <strong className="font-medium text-ink">“{q}”</strong>.
        </p>
        <Link href="/shop/" onClick={onNavigate} className={footerLinkClass}>
          Browse all products
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-2">
      <p role="status" className="sr-only">
        {matches.length} {matches.length === 1 ? "product" : "products"} found
      </p>
      <ul className="divide-y divide-line">
        {matches.slice(0, MAX_RESULTS).map((item) => (
          <li key={item.id}>
            <Link
              href={productPath(item.slug)}
              onClick={onNavigate}
              className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-paper focus-visible:bg-paper"
            >
              {item.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element -- static export: sized via the Sanity CDN
                <img
                  src={item.thumb}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="size-14 shrink-0 rounded-lg border border-line bg-white object-contain"
                />
              ) : (
                <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-lg bg-blush text-crimson">
                  <PaddleIcon className="size-6" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{item.name}</span>
                <span className="block truncate text-sm text-muted">
                  {[item.brand, item.category].filter(Boolean).join(" · ")}
                  {!item.inStock && " · Out of stock"}
                </span>
              </span>
              <span
                className={
                  isOnSale(item)
                    ? "shrink-0 font-medium text-red tabular-nums"
                    : "shrink-0 font-medium tabular-nums"
                }
              >
                {formatPrice(getEffectivePrice(item))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href={shopHref} onClick={onNavigate} className={footerLinkClass}>
        See all {matches.length} {matches.length === 1 ? "result" : "results"}
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </div>
  );
}

const footerLinkClass =
  "mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-crimson transition-colors hover:text-ink";
