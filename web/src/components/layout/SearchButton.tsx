"use client";

import { Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useHasOpened } from "@/lib/hooks/useHasOpened";
import { loadSearchIndex, retrySearchIndexIfFailed } from "@/lib/searchIndex";

// The overlay (and Motion, which animates it) is downloaded only when search is first wanted.
const loadDrawer = () => import("./SearchDrawer");
const SearchDrawer = dynamic(
  () => loadDrawer().then((mod) => mod.SearchDrawer),
  { ssr: false },
);

/** Start downloading the overlay and the search index as soon as the user shows intent. */
function preload() {
  void loadDrawer();
  void loadSearchIndex();
}

/**
 * Header search icon. Opens an overlay with instant results from /search-index.json
 * (fetched on first open). Enter, or "See all results", goes to /shop/?q=… for the full filtered list.
 */
export function SearchButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const mounted = useHasOpened(open);

  const openSearch = () => {
    retrySearchIndexIfFailed();
    preload();
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
        onPointerDown={preload}
        onPointerEnter={preload}
        onFocus={preload}
        onClick={openSearch}
      >
        <Search aria-hidden className="size-6!" />
      </Button>
      {mounted && (
        <SearchDrawer
          open={open}
          onClose={() => setOpen(false)}
          query={query}
          onQueryChange={setQuery}
        />
      )}
    </>
  );
}
