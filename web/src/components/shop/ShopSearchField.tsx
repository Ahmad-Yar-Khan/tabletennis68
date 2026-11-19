"use client";

import { Search, X } from "lucide-react";
import { useId, useRef } from "react";
import { useDebouncedInput } from "@/lib/hooks/useDebouncedInput";
import { cn } from "@/lib/utils";

type ShopSearchFieldProps = {
  /** The committed search (from the URL). */
  value: string;
  onCommit: (query: string) => void;
  placeholder?: string;
  className?: string;
};

/**
 * Search box for product listings. Keeps its own text state so typing only re-renders this field;
 * the search is committed (and the grid filtered) after a short pause.
 */
export function ShopSearchField({
  value: committed,
  onCommit,
  placeholder = "Search by name or brand",
  className,
}: ShopSearchFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { value, onChange, flush, setValue } = useDebouncedInput(
    committed,
    onCommit,
    {
      delay: 250,
    },
  );

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        flush(value);
        inputRef.current?.blur(); // hides the phone keyboard so results are visible
      }}
      className={cn("relative", className)}
    >
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
      />
      <input
        ref={inputRef}
        id={id}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-pill border-2 border-line bg-white pr-12 pl-11 text-base outline-none placeholder:text-muted focus:border-red [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            flush("");
            inputRef.current?.focus();
          }}
          className="absolute top-1/2 right-1.5 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-blush hover:text-crimson"
        >
          <X aria-hidden className="size-5" />
        </button>
      )}
    </form>
  );
}
