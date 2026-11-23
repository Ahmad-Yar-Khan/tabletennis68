"use client";

import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState } from "react";
import { useHasOpened } from "@/lib/hooks/useHasOpened";
import { cn } from "@/lib/utils";

// The panel (and Motion, which animates it) is downloaded when a dropdown is first wanted.
const loadPanel = () => import("./NavDropdownPanel");
const NavDropdownPanel = dynamic(
  () => loadPanel().then((mod) => mod.NavDropdownPanel),
  { ssr: false },
);
const preloadPanel = () => void loadPanel();

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
  const mounted = useHasOpened(open);

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
        onPointerDown={preloadPanel}
        onPointerEnter={preloadPanel}
        onFocus={preloadPanel}
        onClick={() => setOpen((v) => !v)}
        className={cn(buttonClassName, active && "text-(--hdr-accent)")}
      >
        {label}
        <ChevronDown
          aria-hidden
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {mounted && (
        <NavDropdownPanel
          id={menuId}
          open={open}
          items={items}
          footerLink={footerLink}
          current={current}
          onNavigate={() => setOpen(false)}
        />
      )}
    </li>
  );
}
