"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useDeferredValue, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Skeleton } from "@/components/ui/Skeleton";
import { SearchResults } from "./SearchResults";

export type SearchDrawerProps = {
  open: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
};

/** The header search overlay: input plus instant results. Loaded on demand by <SearchButton>. */
export function SearchDrawer({
  open,
  onClose,
  query,
  onQueryChange,
}: SearchDrawerProps) {
  const router = useRouter();
  // Typing stays instant; matching runs at low priority.
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Drawer
      open={open}
      onClose={onClose}
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
            onClose();
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
              onChange={(e) => onQueryChange(e.target.value)}
              className="h-12 w-full rounded-pill border-2 border-line bg-paper pr-4 pl-11 text-base outline-none placeholder:text-muted focus:border-red focus:bg-white"
            />
          </div>
          <Button type="submit" className="hidden sm:inline-flex">
            Search
          </Button>
        </form>
        <div className="mt-2">
          <Suspense fallback={<ResultsSkeleton />}>
            <SearchResults query={deferredQuery} onNavigate={onClose} />
          </Suspense>
        </div>
      </div>
    </Drawer>
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
