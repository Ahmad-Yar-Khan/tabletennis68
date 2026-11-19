"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type NavDropdownItem = {
  key: string;
  href: string;
  label: string;
  count: number;
};

type NavDropdownProps = {
  label: string;
  items: NavDropdownItem[];
  /** "View all" link at the bottom of the panel. */
  footerLink: { href: string; label: string };
  /** True when the current page belongs to this menu (highlights the button). */
  active: boolean;
  /** Returns "page" for the item matching the current URL. */
  current: (href: string) => "page" | undefined;
  /** Class for the trigger button (shared with the other nav links). */
  buttonClassName: string;
};

/** Desktop nav item that opens a two-column panel of links (categories, brands). */
export function NavDropdown({
  label,
  items,
  footerLink,
  active,
  current,
  buttonClassName,
}: NavDropdownProps) {
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

  return (
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
        className={cn(buttonClassName, active && "text-(--hdr-accent)")}
      >
        {label}
        <ChevronDown
          aria-hidden
          className={cn("size-4 transition-transform", open && "rotate-180")}
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
            <ul className="grid max-h-[60dvh] grid-cols-2 gap-1 overflow-y-auto">
              {items.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={current(item.href)}
                    className="flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 py-2 font-medium transition-colors hover:bg-paper hover:text-crimson aria-[current=page]:text-crimson"
                  >
                    <span>{item.label}</span>
                    <span className="text-sm text-muted tabular-nums">
                      {item.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={footerLink.href}
              onClick={() => setOpen(false)}
              className="mt-2 flex min-h-11 items-center justify-center rounded-pill bg-blush px-3 font-medium text-crimson transition-colors hover:bg-red hover:text-white"
            >
              {footerLink.label}
            </Link>
          </m.div>
        )}
      </AnimatePresence>
    </li>
  );
}
