"use client";

import { Search } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";

/** Header search icon. Opens a panel whose form goes to /shop/?q=… (filtered client-side there). */
export function SearchButton() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search products"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Search aria-hidden className="size-6!" />
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Search products"
        hideTitle
        side="top"
        initialFocusRef={inputRef}
      >
        <form
          action="/shop/"
          method="get"
          role="search"
          className="mx-auto flex max-w-site items-center gap-2 py-4 pr-16 pl-4 sm:px-20"
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
              className="h-12 w-full rounded-pill border-2 border-line bg-paper pr-4 pl-11 text-base outline-none placeholder:text-muted focus:border-red focus:bg-white"
            />
          </div>
          <Button type="submit" className="hidden sm:inline-flex">
            Search
          </Button>
        </form>
      </Drawer>
    </>
  );
}
