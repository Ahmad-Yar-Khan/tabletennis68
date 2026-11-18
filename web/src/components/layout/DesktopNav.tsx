"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const linkClass =
  // Colours come from the header's CSS variables (StickyHeader), so they flip when it turns dark.
  "inline-flex h-11 items-center gap-1 rounded-md px-3 font-display text-lg font-bold tracking-wide uppercase italic transition-colors hover:text-(--hdr-accent) aria-[current=page]:text-(--hdr-accent)";

/** "/shop" and "/shop/" both become "/shop/", so prefix checks work either way. */
function withSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

/** Desktop navigation (lg and up): Shop, Categories dropdown, Brands, Contact. */
export function DesktopNav({
  categories,
  className,
}: {
  categories: Category[];
  className?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const path = withSlash(pathname);
  const current = (href: string) =>
    path.startsWith(href) ? "page" : undefined;
  const inCategory = path.startsWith("/category/");

  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex items-center gap-1">
        <li>
          <Link
            href="/shop/"
            className={linkClass}
            aria-current={current("/shop/")}
          >
            Shop
          </Link>
        </li>
        <li
          ref={wrapperRef}
          className="relative"
          onKeyDown={(e) => {
            if (e.key === "Escape" && open) {
              setOpen(false);
              buttonRef.current?.focus();
            }
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null))
              setOpen(false);
          }}
        >
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
            className={cn(linkClass, inCategory && "text-(--hdr-accent)")}
          >
            Categories
            <ChevronDown
              aria-hidden
              className={cn(
                "size-4 transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
          <AnimatePresence>
            {open && (
              <m.div
                id={menuId}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="absolute top-full left-0 z-50 mt-2 w-[30rem] rounded-card border border-line bg-white p-3 text-ink shadow-lift"
              >
                <ul className="grid grid-cols-2 gap-1">
                  {categories.map((c) => (
                    <li key={c._id}>
                      <Link
                        href={`/category/${c.slug}/`}
                        onClick={() => setOpen(false)}
                        aria-current={current(`/category/${c.slug}/`)}
                        className="flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 py-2 font-medium transition-colors hover:bg-paper hover:text-crimson aria-[current=page]:text-crimson"
                      >
                        <span>{c.name}</span>
                        <span className="text-sm text-muted tabular-nums">
                          {c.productCount}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/shop/"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex min-h-11 items-center justify-center rounded-pill bg-blush px-3 font-medium text-crimson transition-colors hover:bg-red hover:text-white"
                >
                  Browse all products
                </Link>
              </m.div>
            )}
          </AnimatePresence>
        </li>
        <li>
          <Link href="/#brands" className={linkClass}>
            Brands
          </Link>
        </li>
        <li>
          <Link
            href="/contact/"
            className={linkClass}
            aria-current={current("/contact/")}
          >
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
}
