"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import type { Brand, Category } from "@/lib/types";
import { buildWhatsAppLink, greetingMessage } from "@/lib/whatsapp";

export type MobileMenuDrawerProps = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  brands: Brand[];
  whatsappNumber: string | null;
  shopName: string;
};

const mainLinks = [
  { href: "/shop/", label: "Shop all products" },
  { href: "/about/", label: "About us" },
  { href: "/contact/", label: "Contact" },
];

/** The site menu in a left drawer. Loaded on demand by <MobileMenu>. */
export function MobileMenuDrawer({
  open,
  onClose,
  categories,
  brands,
  whatsappNumber,
  shopName,
}: MobileMenuDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Menu"
      side="left"
      footer={
        whatsappNumber ? (
          <Button
            variant="whatsapp"
            fullWidth
            href={buildWhatsAppLink(whatsappNumber, greetingMessage(shopName))}
          >
            <WhatsAppIcon />
            Chat on WhatsApp
          </Button>
        ) : undefined
      }
    >
      <nav aria-label="Mobile" className="px-2 py-3">
        <ul>
          {mainLinks.slice(0, 1).map((link) => (
            <MenuLink key={link.href} {...link} onClick={onClose} strong />
          ))}
        </ul>

        {categories.length > 0 && (
          <>
            <p className="mt-4 px-3 pb-1 text-xs font-medium tracking-wider text-muted uppercase">
              Categories
            </p>
            <ul>
              {categories.map((c) => (
                <MenuLink
                  key={c._id}
                  href={`/category/${c.slug}/`}
                  label={c.name}
                  meta={c.productCount}
                  onClick={onClose}
                />
              ))}
            </ul>
          </>
        )}

        {brands.length > 0 && (
          <>
            <p className="mt-4 px-3 pb-1 text-xs font-medium tracking-wider text-muted uppercase">
              Brands
            </p>
            <ul>
              {brands.map((b) => (
                <MenuLink
                  key={b._id}
                  href={`/brand/${b.slug}/`}
                  label={b.name}
                  meta={b.productCount}
                  onClick={onClose}
                />
              ))}
            </ul>
          </>
        )}

        <hr className="my-3 border-line" />
        <ul>
          {mainLinks.slice(1).map((link) => (
            <MenuLink key={link.href} {...link} onClick={onClose} strong />
          ))}
        </ul>
      </nav>
    </Drawer>
  );
}

function MenuLink({
  href,
  label,
  meta,
  strong = false,
  onClick,
}: {
  href: string;
  label: string;
  meta?: number;
  strong?: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className={
          strong
            ? "flex min-h-12 items-center justify-between rounded-lg px-3 font-display text-xl font-bold tracking-wide uppercase italic transition-colors hover:bg-paper hover:text-crimson"
            : "flex min-h-11 items-center justify-between rounded-lg px-3 transition-colors hover:bg-paper hover:text-crimson"
        }
      >
        <span>{label}</span>
        {meta !== undefined ? (
          <span className="text-sm text-muted tabular-nums">{meta}</span>
        ) : (
          <ChevronRight aria-hidden className="size-5 text-muted" />
        )}
      </Link>
    </li>
  );
}
