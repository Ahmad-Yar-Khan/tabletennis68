"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useDeferredValue, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Skeleton } from "@/components/ui/Skeleton";
import { loadSearchIndex, retrySearchIndexIfFailed } from "@/lib/searchIndex";
import { SearchResults } from "./SearchResults";

/**
 * Header search icon. Opens an overlay with instant results from /search-index.json
 * (fetched on first open). Enter, or "See all results", goes to /shop/?q=… for the full filtered list.
 */
export function SearchButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Typing stays instant; matching runs at low priority.
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => setOpen(false);

  const openSearch = () => {
    retrySearchIndexIfFailed();
    void loadSearchIndex();
    setQuery("");
    setOpen(true);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search products"
        aria-haspopup="dialog"
        aria-expanded={open}
        // Start downloading the index as soon as the user shows intent.
        onPointerEnter={() => void loadSearchIndex()}
        onFocus={() => void loadSearchIndex()}
        onClick={openSearch}
      >
        <Search aria-hidden className="size-6!" />
      </Button>
      <Drawer
        open={open}
        onClose={close}
        title="Search products"
        hideTitle
        side="top"
        initialFocusRef={inputRef}
      >
        <div className="mx-auto max-w-site py-4 pr-16 pl-4 sm:px-20">
          <form
            action="/shop/"
            method="get"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              close();
              router.push(q ? `/shop/?q=${encodeURIComponent(q)}` : "/shop/");
            }}
            className="flex items-center gap-2"
          >
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
              />
              <input
                ref={inputRef}
                id="site-search"
                name="q"
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder="Rackets, rubbers, brands…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 w-full rounded-pill border-2 border-line bg-paper pr-4 pl-11 text-base outline-none placeholder:text-muted focus:border-red focus:bg-white"
              />
            </div>
            <Button type="submit" className="hidden sm:inline-flex">
              Search
            </Button>
          </form>
          <div className="mt-2">
            <Suspense fallback={<ResultsSkeleton />}>
              <SearchResults query={deferredQuery} onNavigate={close} />
            </Suspense>
          </div>
        </div>
      </Drawer>
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-3 py-3" aria-hidden>
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-14 shrink-0" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}
