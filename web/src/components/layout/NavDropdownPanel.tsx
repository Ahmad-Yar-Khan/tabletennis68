"use client";

import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import type { NavDropdownItem } from "./NavDropdown";

export type NavDropdownPanelProps = {
  id: string;
  open: boolean;
  items: NavDropdownItem[];
  footerLink: { href: string; label: string };
  current: (href: string) => "page" | undefined;
  onNavigate: () => void;
};

/** The animated two-column panel of a desktop nav dropdown. Loaded on demand by <NavDropdown>. */
export function NavDropdownPanel({
  id,
  open,
  items,
  footerLink,
  current,
  onNavigate,
}: NavDropdownPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <m.div
          id={id}
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
                  onClick={onNavigate}
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
            onClick={onNavigate}
            className="mt-2 flex min-h-11 items-center justify-center rounded-pill bg-blush px-3 font-medium text-crimson transition-colors hover:bg-red hover:text-white"
          >
            {footerLink.label}
          </Link>
        </m.div>
      )}
    </AnimatePresence>
  );
}
