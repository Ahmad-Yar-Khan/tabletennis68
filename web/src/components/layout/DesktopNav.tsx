"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Brand, Category } from "@/lib/types";
import { NavDropdown } from "./NavDropdown";

const linkClass =
  // Colours come from the header's CSS variables (StickyHeader), so they flip when it turns dark.
  "inline-flex h-11 items-center gap-1 rounded-md px-3 font-display text-lg font-bold tracking-wide uppercase italic transition-colors hover:text-(--hdr-accent) aria-[current=page]:text-(--hdr-accent)";

/** "/shop" and "/shop/" both become "/shop/", so prefix checks work either way. */
function withSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

/** Desktop navigation (lg and up): Shop, Categories dropdown, Brands dropdown, Contact. */
export function DesktopNav({
  categories,
  brands,
  className,
}: {
  categories: Category[];
  brands: Brand[];
  className?: string;
}) {
  const path = withSlash(usePathname());
  const current = (href: string) =>
    path.startsWith(href) ? "page" : undefined;

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
        {categories.length > 0 && (
          <NavDropdown
            label="Categories"
            items={categories.map((c) => ({
              key: c._id,
              href: `/category/${c.slug}/`,
              label: c.name,
              count: c.productCount,
            }))}
            footerLink={{ href: "/shop/", label: "Browse all products" }}
            active={path.startsWith("/category/")}
            current={current}
            buttonClassName={linkClass}
          />
        )}
        {brands.length > 0 && (
          <NavDropdown
            label="Brands"
            items={brands.map((b) => ({
              key: b._id,
              href: `/brand/${b.slug}/`,
              label: b.name,
              count: b.productCount,
            }))}
            footerLink={{ href: "/shop/", label: "Browse all products" }}
            active={path.startsWith("/brand/")}
            current={current}
            buttonClassName={linkClass}
          />
        )}
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
