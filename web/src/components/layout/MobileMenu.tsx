"use client";

import { ChevronRight, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import type { Category } from "@/lib/types";
import { buildWhatsAppLink, greetingMessage } from "@/lib/whatsapp";

type MobileMenuProps = {
  categories: Category[];
  whatsappNumber: string | null;
  shopName: string;
};

const mainLinks = [
  { href: "/shop/", label: "Shop all products" },
  { href: "/#brands", label: "Brands" },
  { href: "/about/", label: "About us" },
  { href: "/contact/", label: "Contact" },
];

/** Hamburger button (below lg) that opens the site menu in a left drawer. */
export function MobileMenu({
  categories,
  whatsappNumber,
  shopName,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="-ml-2 lg:hidden"
      >
        <Menu aria-hidden className="size-6!" />
      </Button>
      <Drawer
        open={open}
        onClose={close}
        title="Menu"
        side="left"
        footer={
          whatsappNumber ? (
            <Button
              variant="whatsapp"
              fullWidth
              href={buildWhatsAppLink(
                whatsappNumber,
                greetingMessage(shopName),
              )}
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
              <MenuLink key={link.href} {...link} onClick={close} strong />
            ))}
          </ul>

          {categories.length > 0 && (
            <>
              <p className="mt-4 px-3 pb-1 text-xs font-semibold tracking-wider text-muted uppercase">
                Categories
              </p>
              <ul>
                {categories.map((c) => (
                  <MenuLink
                    key={c._id}
                    href={`/category/${c.slug}/`}
                    label={c.name}
                    meta={c.productCount}
                    onClick={close}
                  />
                ))}
              </ul>
            </>
          )}

          <hr className="my-3 border-line" />
          <ul>
            {mainLinks.slice(1).map((link) => (
              <MenuLink key={link.href} {...link} onClick={close} strong />
            ))}
          </ul>
        </nav>
      </Drawer>
    </>
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
            ? "flex min-h-12 items-center justify-between rounded-lg px-3 font-display text-xl font-semibold tracking-wide uppercase hover:bg-subtle"
            : "flex min-h-11 items-center justify-between rounded-lg px-3 hover:bg-subtle"
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
